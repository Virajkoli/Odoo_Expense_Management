import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary, extractTextFromReceipt } from "@/lib/cloudinary"

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

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      base64File,
      `expenses/${session.user.companyId}`
    )

    // Try to extract OCR data if requested
    const extractOcr = formData.get('extractOcr') === 'true'
    let ocrData = null

    if (extractOcr) {
      ocrData = await extractTextFromReceipt(url)
    }

    return NextResponse.json({
      url,
      publicId,
      ocrData,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
