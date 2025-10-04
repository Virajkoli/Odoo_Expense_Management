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
export async function extractTextFromReceipt(imageUrl: string) {
  try {
    // Use Cloudinary's Google Vision AI add-on for OCR
    const result = await cloudinary.uploader.upload(imageUrl, {
      ocr: 'adv_ocr',
    })

    return result.info?.ocr?.adv_ocr?.data || null
  } catch (error) {
    console.error('OCR extraction error:', error)
    return null
  }
}
