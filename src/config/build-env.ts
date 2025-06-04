import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from the .env file when not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
}

console.log('Checking for build env variables ...')

// Define validation schema for Sentry environment variables
const sentrySchema = z.object({
  SENTRY_DSN: z.string().url({ message: 'Invalid Sentry DSN' }),
  SENTRY_ORG: z.string(),
  SENTRY_PROJECT: z.string(),
  SENTRY_AUTH_TOKEN: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (process.env.GCR_CI === 'true' && !val) {
          return false
        }
        return true
      },
      {
        message:
          'SENTRY_AUTH_TOKEN is required since it is running in Google Cloud Run'
      }
    )
})

// Validate only Sentry environment variables
const { success, data, error } = sentrySchema.safeParse(process.env)

if (!success && process.env.BUILD_HUSKY !== 'true') {
  console.warn('Sentry environment variables validation failed:')
  error.issues.forEach(({ path, message }) => {
    console.warn(`- ${path[0]}: ${message}`)
  })
  console.warn(
    'Using default Sentry variables for build. Source maps may not be correctly uploaded.'
  )

  // Set defaults for Sentry if validation fails
  error.issues.forEach(({ path, message }) => {
    console.error(`- ${path.join('.')}: ${message}`)
  })
  process.exit(1)
} else {
  console.log('Check completed successfully, proceeding with build ...')
}
