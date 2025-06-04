import { env } from '@config'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { NextFunction, Request, Response } from 'express'

export const verifyScheduler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const schedulerToken = env.SCHEDULER_AUTH_TOKEN
  if (!schedulerToken) {
    return next(new AppError(MESSAGES.SCHEDULER.MISSING_TOKEN, 500))
  }

  if (req.headers.authorization !== schedulerToken) {
    return next(new AppError(MESSAGES.SCHEDULER.INVALID_TOKEN, 403))
  }

  next()
}
