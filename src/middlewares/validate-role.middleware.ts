import { UserRoleType } from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { NextFunction, Request, Response } from 'express'

/**
 * Middleware to validate the role of a user.
 * @param roles The role(s) to validate against.
 * @returns Express middleware function.
 */
export const validateRole = (...roles: UserRoleType[]) => {
  /**
   * Middleware function to check if the user has the required role.
   * @param req The request object.
   * @param res The response object.
   * @param next The next function.
   */
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user?.role)) {
      return next(new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403))
    }
    return next()
  }
}
