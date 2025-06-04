import { ZodIssue } from 'zod'

export class AppError extends Error {
  statusCode: number
  status: string
  validationErrors: ZodIssue[]
  isOperational: boolean

  /**
   * @class AppError
   * @extends Error
   *
   * @description
   * A custom error class that adds a statusCode and a status to the error object.
   * The status is either "failed" for 4xx status codes or "error" for 5xx status codes.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   * @param {array} validationErrors - Array for additional validation errors that need to be sent.
   *
   * @property {number} statusCode - The HTTP status code.
   * @property {string} status - Either "failed" or "error".
   * @property {array} validationErrors - Array for additional validation errors that need to be sent.
   * @property {boolean} isOperational - A flag to indicate that the error is an operational error (i.e., not a programming error).
   */
  constructor(
    message: string,
    statusCode: number,
    validationErrors: ZodIssue[] = []
  ) {
    super(message)

    // The HTTP status code.
    this.statusCode = statusCode

    // Array for additional validation errors that need to be sent.
    this.validationErrors = validationErrors

    // The status of the error. Either "failed" or "error".
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error'

    // A flag to indicate that the error is an operational error (i.e., not a programming error).
    this.isOperational = true

    // Capture the stack trace to be able to log it if needed.
    Error.captureStackTrace(this, this.constructor)
  }
}
