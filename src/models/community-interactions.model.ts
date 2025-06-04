import { Tables } from '@constants'
import { ICommunityInteractionsDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const communityInteractionsSchema = new Schema<ICommunityInteractionsDocument>({
  post: {
    type: Schema.Types.ObjectId,
    ref: Tables.Post,
    required: true,
    unique: true
  },
  impressions: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  visitors: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
}).add(baseSchema)

communityInteractionsSchema.methods.toJSON = function () {
  const communityInteractions = baseSchema.methods.toJSON.call(this)
  communityInteractions.user = serializeExtended(this.user)
  return communityInteractions
}
export const CommunityInteractionsModel =
  mongoose.model<ICommunityInteractionsDocument>(
    Tables.CommunityInteractions,
    communityInteractionsSchema
  )
