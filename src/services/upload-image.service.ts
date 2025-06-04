import fs from 'fs'
import { readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { FolderNames, MediaTypes, UploadImageResponse } from '@commonTypes'
import { env, storage } from '@config'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import sharp from 'sharp'

import { loggerService } from './logger.service'

export class UploadImageService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegPath!)
  }

  private async compressVideo(buffer: Buffer): Promise<string> {
    const output = `output-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp4`
    const outputDir = path.resolve(__dirname, '../../tmp')
    const outputPath = path.join(outputDir, output)
    const inputPath = path.join(outputDir, `input-${Date.now()}.mp4`)

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    try {
      // Write the input buffer to a temporary file
      await writeFile(inputPath, buffer)

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .inputFormat('mp4')
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-crf 28', // Constant Rate Factor (lower = better quality but larger file)
            '-preset fast', // Compression speed vs. file size tradeoff
            '-movflags faststart' // Enable streaming
          ])
          .on('error', async (err) => {
            loggerService.error(`Video compression failed: ${err.message}`)
            // Clean up input file
            try {
              await unlink(inputPath)
            } catch (cleanupError) {
              loggerService.error(
                `Failed to clean up input file: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`
              )
            }
            reject(err)
          })
          .on('end', async () => {
            loggerService.log('Video compression completed')
            // Clean up input file
            try {
              await unlink(inputPath)
            } catch (cleanupError) {
              loggerService.error(
                `Failed to clean up input file: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`
              )
            }
            resolve(output)
          })
          .saveToFile(outputPath)
      })
    } catch (error) {
      loggerService.error(
        `Video compression setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  public async uploadSingleImage(
    file: any,
    timestamp: Date
  ): Promise<UploadImageResponse> {
    const isImage = file.mimetype.includes(MediaTypes.Image)
    let buffer = file.buffer
    let fileName = file.originalname
    const isVideo = file.mimetype.includes(MediaTypes.Video)

    loggerService.log(
      `Processing file: isImage=${isImage}, isVideo=${isVideo}, mimetype=${file.mimetype}`
    )

    // If the file is an image, convert it to WebP
    if (isImage) {
      buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer()
      fileName = fileName.replace(/\.[^/.]+$/, '.webp')
    }

    let outputFileName: string | undefined
    // If the file is a video, compress it
    if (isVideo) {
      try {
        outputFileName = await this.compressVideo(file.buffer)
        const outputDir = path.resolve(__dirname, '../../tmp')
        const outputPath = path.join(outputDir, outputFileName)

        // Wait for the file to be fully written
        await new Promise((resolve) => setTimeout(resolve, 1000))

        buffer = await readFile(outputPath)
        fileName = fileName.replace(/\.[^/.]+$/, '.mp4')
      } catch (error) {
        loggerService.error(
          `Video compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        throw error
      }
    }

    const folder = file.mimetype.includes(MediaTypes.Image)
      ? FolderNames.Images
      : file.mimetype.includes(MediaTypes.Video)
        ? FolderNames.Videos
        : FolderNames.Documents
    const filePath = `v2/${env.APP_ENV}/${folder}/${timestamp.getTime()}_${fileName}`
    const fileRef = storage.file(filePath)
    const options = {
      metadata: {
        contentType: isImage ? 'image/webp' : file.mimetype
      },
      resumable: true,
      timeout: 60000
    }

    // Save the file to Firebase Storage
    await fileRef.save(buffer, options)
    // Make the file public
    await fileRef.makePublic()
    // Get the public URL
    const publicUrl = fileRef.publicUrl()

    // Clean up temporary file if it exists
    if (outputFileName) {
      try {
        const outputDir = path.resolve(__dirname, '../../tmp')
        const outputPath = path.join(outputDir, outputFileName)
        await unlink(outputPath)
      } catch (error) {
        loggerService.error(
          `Failed to delete temporary file: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return {
      url: publicUrl,
      type: isImage ? MediaTypes.Image : MediaTypes.Video
    }
  }
}

export const uploadImageService = new UploadImageService()
