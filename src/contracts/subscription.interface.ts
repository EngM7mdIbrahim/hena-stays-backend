import { Subscriptions } from '@commonTypes'
import { Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface ISubscriptionsDocument
  extends BaseEntity,
    Omit<Subscriptions, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedSubscriptionsDocument
  extends Omit<ISubscriptionsDocument, 'user'> {
  user: PopulatedUserDocument
}

export type CreateSubscriptionsDto = Omit<Subscriptions, '_id' | 'createdAt'>
