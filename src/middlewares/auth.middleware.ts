import { MESSAGES } from '@constants'
import { AppError, JwtObject } from '@contracts'
import { UserModel } from '@models'
import { NextFunction, Request, Response } from 'express'
import { TokenExpiredError, VerifyErrors } from 'jsonwebtoken'

import { verifyJwt } from '@utils'

// This middleware is used to parse the JWT token from the Authorization header
export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return next(new AppError(MESSAGES.AUTH.NO_TOKEN_PROVIDED, 401))
  }

  let payload: JwtObject
  try {
    payload = verifyJwt(token)
  } catch (e) {
    const verifyErr = e as VerifyErrors
    if (verifyErr instanceof TokenExpiredError) {
      return next(new AppError(MESSAGES.AUTH.EXPIRED_TOKEN, 401))
    }
    return next(new AppError(MESSAGES.AUTH.BAD_TOKEN, 401))
  }

  const user = await UserModel.findById(payload.id)
  if (!user) {
    return next(new AppError(MESSAGES.USER.NOT_FOUND, 404))
  }
  req.user = user
  req.loggedInMode = payload.mode
  return next()
}
