import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export async function uploadToCloudinary(
  file: string,
  folder: string = 'expenses'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file')
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file')
  }
}

// OCR functionality using Cloudinary's AI
export async function extractTextFromReceipt(publicId: string) {
  try {
    // Use Cloudinary's Google Cloud Vision AI add-on for OCR
    // This requires the Google Cloud Vision add-on to be enabled in Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      ocr: 'adv_ocr',
    })

    // Return OCR data if available
    return result.info?.ocr?.adv_ocr?.data || null
  } catch (error) {
    console.error('OCR extraction error:', error)
    // If OCR add-on is not available, try basic text detection
    try {
      const result = await cloudinary.api.resource(publicId)
      return result.info?.detection?.ocr?.data || null
    } catch (fallbackError) {
      console.error('Fallback OCR error:', fallbackError)
      return null
    }
  }
}

// Alternative: Extract OCR during upload
export async function uploadWithOcr(
  file: string,
  folder: string = 'expenses'
): Promise<{ url: string; publicId: string; ocrData: any }> {
  try {
    // Upload with OCR enabled
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      ocr: 'adv_ocr', // Enable advanced OCR with Google Cloud Vision
    })

    // Extract OCR data from upload result
    const ocrData = result.info?.ocr?.adv_ocr?.data || null

    return {
      url: result.secure_url,
      publicId: result.public_id,
      ocrData,
    }
  } catch (error) {
    console.error('Cloudinary upload with OCR error:', error)
    // Fallback to regular upload if OCR fails
    const result = await uploadToCloudinary(file, folder)
    return {
      ...result,
      ocrData: null,
    }
  }
}
