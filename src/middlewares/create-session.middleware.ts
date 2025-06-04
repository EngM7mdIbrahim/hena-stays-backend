import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'

export const createSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  req.dbSession = session
  next()
}
