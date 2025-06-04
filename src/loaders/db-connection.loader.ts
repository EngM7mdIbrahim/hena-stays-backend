import { env } from '@config'
import { loggerService } from '@services'
import mongoose from 'mongoose'

export async function loadDBConnection(): Promise<void> {
  const connection = await mongoose.connect(env.MONGO_DB_URL)
  loggerService.log(`Connected to MongoDB: ${connection.connection.host}`)
}
