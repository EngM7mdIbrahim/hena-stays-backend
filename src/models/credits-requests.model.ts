import { CreditRequestStatus } from '@commonTypes'
import { Tables } from '@constants'
import { ICreditsRequestDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { mediaSchema } from './media.schema'

const creditsRequestSchema = new Schema<ICreditsRequestDocument>({
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  status: {
    type: String,
    enum: Object.values(CreditRequestStatus),
    required: true
  },
  credits: { type: Number, required: true },
  fees: { type: Number, required: true },
  taxes: { type: Number },
  total: { type: Number },
  media: mediaSchema
}).add(baseSchema)

creditsRequestSchema.methods.toJSON = function () {
  const creditsRequest = this.toObject()
  creditsRequest.user = serializeExtended(creditsRequest.user)
  delete creditsRequest._id
  return creditsRequest
}

creditsRequestSchema.pre('save', async function (next) {
  if (this.isModified('fees') || this.isNew) {
    this.taxes = this.fees * 0.05
    this.total = this.fees + this.taxes
  }
  next()
})

export const CreditsRequestModel = model<ICreditsRequestDocument>(
  Tables.CreditsRequest,
  creditsRequestSchema
)
