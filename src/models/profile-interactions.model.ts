import { Tables } from '@constants'
import { IProfileInteractionsDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const profileInteractionsSchema = new Schema<IProfileInteractionsDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true,
    unique: true
  },
  views: { type: Number, default: 0 },
  visitors: { type: Number, default: 0 }
}).add(baseSchema)

profileInteractionsSchema.methods.toJSON = function () {
  const profileInteractions = baseSchema.methods.toJSON.call(this)
  profileInteractions.user = serializeExtended(this.user)
  return profileInteractions
}

export const ProfileInteractionsModel =
  mongoose.model<IProfileInteractionsDocument>(
    Tables.ProfileInteractions,
    profileInteractionsSchema
  )
