import fs from 'fs'
import path from 'path'
import { env, storage } from '@config'
import moment from 'moment'
import { uploadToFirebase } from 'src/utils/upload-to-firebase'

import { archiveBackup, execPromise } from '@utils'

import { loggerService } from './logger.service'

class DbBackupService {
  constructor() {}
  async fetchAllCollections() {
    const targetUri = env.MONGO_DB_URL
    const backupDir = path.join('./tmp', 'mongo-backup')
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir)
    loggerService.info('Backing up collections...')
    const dumpCommand = `mongodump --uri="${targetUri}" --out="${backupDir}"`
    await execPromise(dumpCommand)
    loggerService.info('Collections backed up.')
  }
  async enforceRetentionPolicy() {
    const [files] = await storage.getFiles({ prefix: 'backups/' })
    const sortedFiles = files.sort((a: any, b: any) =>
      a.metadata.timeCreated.localeCompare(b.metadata.timeCreated)
    )
    if (sortedFiles.length > env.DB_BACKUPS_RETENTION_PERIOD_IN_DAYS) {
      const filesToDelete = sortedFiles.slice(
        0,
        sortedFiles.length - env.DB_BACKUPS_RETENTION_PERIOD_IN_DAYS
      )
      for (const file of filesToDelete) {
        await file.delete()
        loggerService.info(`Deleted old backup: ${file.name}`)
      }
    }
  }

  async dbBackup() {
    const zipFilePath = path.join(
      './tmp',
      `mongo-backup-${moment().format('D_M_YYYY-H_mm_ss')}.zip`
    )
    const backupDir = path.join('./tmp', 'mongo-backup')
    const destination = `backups/mongo-backup-${moment().format(
      'D_M_YYYY-H_mm_ss'
    )}.zip`
    try {
      loggerService.info('Starting db backup...')
      try {
        loggerService.info('Fetching collections...')
        await this.fetchAllCollections()
        loggerService.info('Collections fetched.')
      } catch (err: any) {
        throw new Error(`Error fetching collections: ${err?.message}`)
      }
      try {
        loggerService.info('Archiving backup...')
        await archiveBackup(zipFilePath, backupDir)
        loggerService.info(`Backup archived: ${zipFilePath}`)
      } catch (err: any) {
        throw new Error(`Error archiving backup: ${err?.message}`)
      }
      try {
        loggerService.info('Uploading backup to Firebase...')
        await uploadToFirebase(zipFilePath, destination)
        loggerService.info(`Backup uploaded to Firebase: ${destination}`)
      } catch (err: any) {
        throw new Error(`Error uploading backup to Firebase: ${err?.message}`)
      }
      try {
        loggerService.info('Enforcing retention policy...')
        await this.enforceRetentionPolicy()
        loggerService.info('Retention policy enforced.')
      } catch (err: any) {
        throw new Error(`Error enforcing retention policy: ${err?.message}`)
      }
    } catch (err: any) {
      throw new Error(`Error backing up db: ${err?.message}`)
    } finally {
      fs.rmSync('/tmp/mongo-backup', { recursive: true, force: true })
      fs.rmSync(zipFilePath, { force: true })
    }
  }
}

export const dbBackupService = new DbBackupService()
