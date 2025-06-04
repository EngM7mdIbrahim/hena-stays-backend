'use strict'

import fs from 'fs'
import { readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { FolderNames } from '@commonTypes'
import { storage } from '@config'
import axios from 'axios'
import ffmpegPath from 'ffmpeg-static'
import * as admin from 'firebase-admin'
import ffmpeg from 'fluent-ffmpeg'
import mime from 'mime-types'
import { Document } from 'mongodb'
import mongoose, { Collection } from 'mongoose'
import sharp from 'sharp'

import { loggerService } from '../../src/services/logger.service'
import { env } from './env'

export const firebaseAdmin = admin
export const storageAdmin = admin.storage().bucket()

function extractFileNameFromGoogleStorageURL(url: string): string | null {
  const urlFinal = decodeURIComponent(url)
  const parts = urlFinal.split('/')

  const fileNamePart = parts[parts.length - 1]?.split('%2F')
  const fileName =
    fileNamePart && fileNamePart.length > 0
      ? fileNamePart[fileNamePart.length - 1]
      : null
  return fileName!
}

async function compressVideo(buffer: Buffer): Promise<string> {
  ffmpeg.setFfmpegPath(ffmpegPath!)
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

async function downloadFile(
  url: string
): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Accept: '*/*'
      }
    })

    const contentType =
      response.headers['content-type'] || 'application/octet-stream'
    return {
      buffer: Buffer.from(response.data, 'binary'),
      contentType
    }
  } catch (error) {
    loggerService.error(
      `Failed to download file from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    throw error
  }
}

async function uploadToNewStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string
): Promise<string> {
  try {
    const fileRef = storage.file(`${folder}/${fileName}`)
    const options = {
      metadata: {
        contentType
      },
      resumable: true,
      timeout: 60000
    }

    await fileRef.save(buffer, options)
    await fileRef.makePublic()
    return fileRef.publicUrl()
  } catch (error) {
    loggerService.error(
      `Failed to upload file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    throw error
  }
}

async function changeUrl(
  fileUrl: string,
  keyPath: string,
  collection: Collection
) {
  loggerService.log(`Transferring file: ${fileUrl}`)
  let fileName = extractFileNameFromGoogleStorageURL(fileUrl)

  if (fileName) {
    try {
      // Download the file from old URL
      let { buffer, contentType } = await downloadFile(fileUrl)
      const mimeType = mime.lookup(fileName)
      if (mimeType) {
        contentType = mimeType
      }
      const isImage = contentType.startsWith('image/')
      const isVideo = contentType.startsWith('video/')
      if (isImage) {
        contentType = 'image/webp'
        buffer = await sharp(buffer).webp({ quality: 80 }).toBuffer()
        fileName = fileName.replace(/\.[^/.]+$/, '.webp')
      }
      let outputFileName: string | undefined

      if (isVideo) {
        try {
          outputFileName = await compressVideo(buffer)
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
      // Determine the folder based on file type
      const folder = isImage
        ? `v2/${env.APP_ENV}/${FolderNames.Images}`
        : isVideo
          ? `v2/${env.APP_ENV}/${FolderNames.Videos}`
          : `v2/${env.APP_ENV}/${FolderNames.Documents}`

      // Upload to new storage
      const newUrl = await uploadToNewStorage(
        buffer,
        fileName,
        contentType,
        folder
      )

      loggerService.log(`Successfully uploaded file: ${fileName}`)
      loggerService.log(`Old URL: ${fileUrl}`)
      loggerService.log(`New URL: ${newUrl}`)
      loggerService.log(`Path: ${keyPath}`)
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
      const pathParts = keyPath.split('.')
      // Update the document with the new URL
      await collection.updateOne(
        { _id: new mongoose.Types.ObjectId(pathParts[0]) },
        { $set: { [pathParts.slice(1).join('.')]: newUrl } }
      )

      loggerService.log(`Successfully transferred file: ${fileName}`)
    } catch (error) {
      loggerService.error(
        `Failed to transfer file ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

async function scanObject(document: any, path: string, collection: Collection) {
  if (Array.isArray(document)) {
    for (let i = 0; i < document.length; i++) {
      await scanObject(document[i], `${path}.${i}`, collection)
    }
  } else if (typeof document === 'object') {
    for (const key in document) {
      const value = document[key]
      await scanObject(value, `${path}.${key}`, collection)
    }
  } else {
    if (
      typeof document === 'string' &&
      document.includes('https://storage.googleapis.com')
    ) {
      await changeUrl(document, path, collection)
    }
  }
}

async function scanCollection(collection: Collection) {
  loggerService.log(`Scanning collection ${collection.collectionName}`)
  const documents = await collection.find().toArray()
  if (documents.length > 0) {
    loggerService.log(
      `Collection ${collection.collectionName} has ${documents.length} documents`
    )
  }

  await Promise.all(
    documents.map(async (document, index) => {
      loggerService.log(`Scanning Document ${index + 1} of ${documents.length}`)
      await scanObject(document, document._id.toString(), collection)
    })
  )
}

async function main(): Promise<void> {
  loggerService.log('Starting transfer...')
  // Connection MongoDB details
  const connectionUri: string | undefined = env.MONGO_DB_TGT
  if (!connectionUri) {
    throw new Error('Connection MongoDB URI (MONGO_DB_TGT) is not defined.')
  }

  const connectionConnection = mongoose.createConnection(connectionUri)
  // Wait for connections to be established
  await connectionConnection.asPromise()

  const connectionDb = connectionConnection.db
  if (!connectionDb) {
    throw new Error('Connection Database connection is not available.')
  }
  loggerService.log('Connection Database connection is available.')

  let collections = await connectionDb.listCollections().toArray()
  collections = collections ?? []
  loggerService.log(`Found ${collections.length} collections.`)

  for (const col of collections) {
    const name = col.name
    if (!name) {
      continue
    }
    const collection = connectionDb.collection(name)
    loggerService.log(`Processing collection ${name}`)
    await scanCollection(collection as Collection)
  }
}

export async function transferMedia(collection: Collection, paths: string[]) {
  const cursor = collection.find({})
  let count = 0

  for await (const doc of cursor) {
    for (const path of paths) {
      const fileUrl = getValueFromPath(doc, path)
      if (
        fileUrl &&
        typeof fileUrl === 'string' &&
        fileUrl.includes('storage.googleapis.com')
      ) {
        await changeUrl(fileUrl, path, collection)
        count++
      }
    }
  }

  loggerService.log(`Transfer completed. Processed ${count} files.`)
}

function getValueFromPath(obj: Document, path: string): any {
  return path.split('.').reduce((o, i) => o?.[i], obj)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    loggerService.error(`Error occurred: ${error}`)
    process.exit(1)
  })
