import { Tables } from '@constants'
import { IInteractionsDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const interactionsSchema = new Schema<IInteractionsDocument>({
  property: {
    type: Schema.Types.ObjectId,
    ref: Tables.Property,
    required: true,
    unique: true
  },
  // this is the number of users who viewed the property
  visitors: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  leadClicks: {
    whatsapp: { type: Number, default: 0 },
    phone: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
    chat: { type: Number, default: 0 }
  },
  // the total views counter from all of the users who viewed the property
  impressions: { type: Number, default: 0 },
  // this is the number of the users who saved the property
  saves: { type: Number, default: 0 }
}).add(baseSchema)

interactionsSchema.methods.toJSON = function () {
  const interactions = baseSchema.methods.toJSON.call(this)
  interactions.property = serializeExtended(this.property)
  return interactions
}

export const InteractionsModel = model<IInteractionsDocument>(
  Tables.Interactions,
  interactionsSchema
)
