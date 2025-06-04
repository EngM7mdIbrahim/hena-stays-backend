import { ClientSession } from 'mongoose'
import { Stripe } from 'stripe'

import { ISubscriptionsDocument } from './subscription.interface'
import { IUserDocument } from './user.interface'

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer
      user?: IUserDocument
      subscription?: ISubscriptionsDocument
      event?: Stripe.Event
      file?: any
      dbSession?: ClientSession
      loggedInMode?: (typeof LoggedInModes)[keyof typeof LoggedInModes]
    }
  }
}
