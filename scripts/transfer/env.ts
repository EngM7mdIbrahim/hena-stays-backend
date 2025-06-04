import path from 'path'
import { APP_ENV } from '@commonTypes'
import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from the .env file when not in production
const envFilePath = path.resolve(__dirname, '.env.scripts')
dotenv.config({ path: envFilePath })

// Define schema for environment variables, including email service configuration
const envSchema = z.object({
  MONGO_DB_SRC: z.string().url({ message: 'Invalid MongoDB SRC URI' }),
  MONGO_DB_TGT: z.string().url({ message: 'Invalid MongoDB TGT URI' }),
  APP_ENV: z.nativeEnum(APP_ENV).default(APP_ENV.DEV)
})

// Validate environment variables
const { success, data, error } = envSchema.safeParse(process.env)

if (!success) {
  console.error('Environment validation failed:')
  error.issues.forEach(({ path, message }) => {
    console.error(`- ${path.join('.')}: ${message}`)
  })
  process.exit(1)
}

// Export validated environment variables
export const env = data
