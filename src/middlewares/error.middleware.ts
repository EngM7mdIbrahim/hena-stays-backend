// IMPORT MODULES
import { ErrorResponseBody } from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { loggerService } from '@services'
import { NextFunction, Request, Response } from 'express'

// CREATING DB ERROR HANDLERS
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value.`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = (): AppError =>
  new AppError(MESSAGES.invalid('token'), 401)

const handleJWTExpiredError = (): AppError =>
  new AppError(MESSAGES.AUTH.EXPIRED_TOKEN, 401)

const handleSequelizeValidationError = (err: any): AppError => {
  const errors = err.errors.map((error: any) => error.message)
  return new AppError(errors.join(' \n '), 400)
}

const handleSequelizeDatabaseError = (err: any): AppError => {
  const type = err.message.split('type ')[1]
  const errMsg = `Invalid input data for ${type}`
  return new AppError(errMsg, 500)
}

// CREATING ERROR RESPONSE FOR PRODUCTION
const sendErrorProd = async (
  err: any,
  req: Request,
  res: Response<ErrorResponseBody>
): Promise<Response> => {
  // A) API
  // if (req.originalUrl.startsWith('/api')) {
  if (req?.dbSession?.transaction?.isActive) {
    loggerService.debug('Aborting transaction, rolling back changes ...')
    await req.dbSession.abortTransaction()
    await req.dbSession.endSession()
    loggerService.debug('Transaction aborted, changes rolled back')
  }
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: err.validationErrors
    })
  }
  // Programming or other unknown error
  loggerService.error(err)
  return res.status(500).json({
    success: false,
    message: MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR,
    data: err.validationErrors
  })
  // }
}

// EXPORT THE ERROR HANDLED MESSAGES
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500
  err.status = 'failed'

  let error = { ...err }
  error.message = err.message

  if (err.name === 'CastError') error = handleCastErrorDB(error)
  if (err.code === 11000) error = handleDuplicateFieldsDB(err)
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error)
  if (err.name === 'JsonWebTokenError') error = handleJWTError()
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError()
  if (error.name === 'SequelizeValidationError')
    error = handleSequelizeValidationError(error)
  if (error.name === 'SequelizeUniqueConstraintError')
    error = handleSequelizeValidationError(error)
  if (error.name === 'SequelizeDatabaseError')
    error = handleSequelizeDatabaseError(error)
  // if (process.env.NODE_ENV === 'development')
  // sendErrorDev(error, req, res, next)
  // if (process.env.NODE_ENV === 'production')
  sendErrorProd(error, req, res)
}
