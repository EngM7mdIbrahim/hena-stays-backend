import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

import { validateSchema } from '@utils'

/**
 * Validates a given body against a provided schema.
 *
 * @param schema - The validation schema.
 * @returns A middleware function that validates the body against the schema.
 */
export const validateMiddleware =
  (schema: ZodSchema, includeParams = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
    /**
     * If no schema is provided, throw an error.
     */
    if (!schema) {
      return next(new AppError(MESSAGES.notFound('schema'), 500))
    }

    /**
     * Validate the body against the schema.
     */
    try {
      await validateSchema(schema, {
        ...req.body,
        ...(includeParams ? req.params : {})
      })
    } catch (error) {
      return next(error)
    }

    /**
     * Call the next middleware function.
     */
    next()
  }
