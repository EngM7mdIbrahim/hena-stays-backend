import fs from 'fs'
import archiver from 'archiver'

export async function archiveBackup(zipFilePath: string, dirPath: string) {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', (): void => resolve(void 0))
    archive.on('error', (err: any) => reject(err))

    archive.pipe(output)
    archive.directory(dirPath, false)
    archive.finalize()
  })

  return zipFilePath
}
