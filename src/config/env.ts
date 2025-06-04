import { APP_ENV, Currencies } from '@commonTypes'
import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from the .env file when not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
}

// Define schema for environment variables, including email service configuration
const envSchema = z.object({
  APP_PORT: z.coerce.number().default(8080),
  APP_ENV: z.nativeEnum(APP_ENV).default(APP_ENV.DEV),
  MONGO_DB_URL: z.string().url({ message: 'Invalid MongoDB URI' }),

  // JWT environment variables
  JWT_SECRET_KEY: z
    .string()
    .min(9, { message: 'JWT secret key must be at least 9 characters long' }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_DOMAIN: z.string().default('localhost:3000'),
  FORGET_PASSWORD_EXPIRES_IN: z.string().default('300000'),
  FORGET_PASSWORD_SECRET_KEY: z.string().min(10, {
    message: 'Forget password secret key must be at least 10 characters long'
  }),
  OTP_EXPIRES_IN: z.string().default('5'),
  // Email Service environment variables
  EMAIL_MAIL: z.string().email({ message: 'Invalid email address format' }),
  EMAIL_PASS: z
    .string()
    .min(8, { message: 'Email password must be at least 8 characters long' }),
  EMAIL_SECURE: z.coerce.boolean().default(true),
  EMAIL_USER: z.string().email({ message: 'Invalid email address format' }),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(465),
  ADMIN_PRIVATE_KEY: z.string(),
  ADMIN_PROJECT_ID: z.string(),
  ADMIN_CLIENT_EMAIL: z.string().email(),
  STORAGE_BUCKET: z.string(),
  GOOGLE_API_KEY: z.string(),
  SCHEDULER_AUTH_TOKEN: z.string(),
  NEWS_URL: z.string(),
  LOGS_RETENTION_PERIOD_IN_DAYS: z.coerce.number().default(180),
  NEWS_RETENTION_PERIOD_IN_DAYS: z.coerce.number().default(90),
  DB_BACKUPS_RETENTION_PERIOD_IN_DAYS: z.coerce.number().default(365),
  SENTRY_DSN: z.string().url({ message: 'Invalid Sentry DSN' }).optional(),
  STRIPE_CLIENT: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  CURRENCY: z.nativeEnum(Currencies).default(Currencies.AED)
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
