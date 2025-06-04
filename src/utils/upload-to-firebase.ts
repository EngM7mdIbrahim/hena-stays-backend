import { storage } from '@config'

export async function uploadToFirebase(
  zipFilePath: string,
  remoteFilePath: string
) {
  await storage.upload(zipFilePath, { destination: remoteFilePath })
}
