import { readFileSync } from 'fs'
import { join } from 'path'
import { uploadImageService } from '@services'

export async function imageUploader(path: string) {
  const imagePath = join(__dirname, path)
  const imageBuffer = readFileSync(imagePath)
  const imageFile = {
    buffer: imageBuffer,
    mimetype: 'image/png',
    originalname: 'logo.png'
  }
  return await uploadImageService.uploadSingleImage(imageFile, new Date())
}
