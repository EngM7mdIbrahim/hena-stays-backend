import { Tables } from '@constants'
import { ISubscriptionsDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const subscriptionSchema = new Schema<ISubscriptionsDocument>({
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  credits: { type: Number, default: 0 }
}).add(baseSchema)

subscriptionSchema.methods.toJSON = function () {
  const subscription = baseSchema.methods.toJSON.call(this)
  subscription.user = serializeExtended(this.user)
  return subscription
}

export const SubscriptionModel = model<ISubscriptionsDocument>(
  Tables.Subscription,
  subscriptionSchema
)
