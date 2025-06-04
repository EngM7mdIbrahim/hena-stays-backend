import { NextFunction, Request, Response } from 'express'

import { authMiddleware } from './auth.middleware'

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next)
  }
  return next()
}
