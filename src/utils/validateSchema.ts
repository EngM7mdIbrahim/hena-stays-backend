import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { ZodSchema } from 'zod' // Assuming you're using Zod for validation

/**
 * Validates a given body against a provided schema.
 *
 * @param schema - The validation schema.
 * @param body - The body to validate.
 * @throws {AppError} If the schema is not provided or validation fails.
 * @returns The validation result.
 */
export const validateSchema = async (schema: ZodSchema, body: unknown) => {
  // Check that the schema is provided.
  if (!schema) {
    throw new AppError(MESSAGES.notFound('schema'), 500)
  }

  // Validate the body against the schema.
  const validation = await schema.safeParseAsync(body)

  // If validation fails, throw an error with the validation errors.
  if (!validation.success) {
    throw new AppError(
      MESSAGES.failed('Validation'),
      400,
      validation.error.errors
    )
  }

  // Return the validation result.
  return validation
}
