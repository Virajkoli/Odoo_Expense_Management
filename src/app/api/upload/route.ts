import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, uploadWithOcr, extractTextFromReceipt } from "@/lib/cloudinary"
import { parseOcrData, validateParsedData } from "@/lib/ocr-parser"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

    // Check if OCR extraction is requested (default: true for automatic extraction)
    const extractOcr = formData.get('extractOcr') !== 'false' // Default to true

    let url: string
    let publicId: string
    let ocrData: any = null
    let parsedData: any = null
    const fileType = file.type // Track the original file type

    if (extractOcr) {
      // Upload with OCR enabled
      console.log('Uploading with OCR enabled...')
      try {
        const uploadResult = await uploadWithOcr(
          base64File,
          `expenses/${session.user.companyId}`
        )
        url = uploadResult.url
        publicId = uploadResult.publicId
        ocrData = uploadResult.ocrData

        // If OCR data was not returned in upload, try to extract it separately
        if (!ocrData) {
          console.log('OCR data not in upload response, attempting separate extraction...')
          // Wait a bit for Cloudinary to process the image
          await new Promise(resolve => setTimeout(resolve, 2000))
          ocrData = await extractTextFromReceipt(publicId)
        }

        // Parse OCR data to extract expense fields
        if (ocrData) {
          console.log('OCR data received, parsing...')
          console.log('OCR data structure:', JSON.stringify(ocrData).substring(0, 500)) // Log first 500 chars
          const rawParsed = parseOcrData(ocrData)
          console.log('Raw parsed result:', rawParsed)
          parsedData = validateParsedData(rawParsed)
          console.log('Parsed expense data:', parsedData)
        } else {
          console.log('No OCR data available - Google Cloud Vision may not be enabled')
        }
      } catch (ocrError: any) {
        console.error('OCR upload error, falling back to regular upload:', ocrError)
        
        // Check if it's an OCR subscription error
        const isOcrSubscriptionError = ocrError?.message?.includes('subscription for OCR') || 
                                       ocrError?.error?.message?.includes('subscription for OCR')
        
        // Fallback to regular upload if OCR fails
        const uploadResult = await uploadToCloudinary(
          base64File,
          `expenses/${session.user.companyId}`
        )
        url = uploadResult.url
        publicId = uploadResult.publicId
        
        // Store the error message if it's OCR-related
        if (isOcrSubscriptionError) {
          ocrData = { error: 'OCR add-on not enabled in Cloudinary' }
        }
      }
    } else {
      // Regular upload without OCR
      const uploadResult = await uploadToCloudinary(
        base64File,
        `expenses/${session.user.companyId}`
      )
      url = uploadResult.url
      publicId = uploadResult.publicId
    }

    return NextResponse.json({
      url,
      publicId,
      fileType, // Include the original file type
      ocrData,
      parsedData, // Auto-extracted expense fields
      ocrAvailable: !!ocrData,
      error: ocrData?.error || undefined, // Include OCR error if present
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
