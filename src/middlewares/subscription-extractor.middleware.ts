import { subscriptionsService } from '@services'
import { NextFunction, Request, Response } from 'express'

export const subscriptionExtractor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const subscription = await subscriptionsService.readOne({
    _id: req.user!.subscription
  })
  req.subscription = subscription ?? undefined
  next()
}
