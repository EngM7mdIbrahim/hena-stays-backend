import { MESSAGES, Tables } from '@constants'
import { IBrokerDocument } from '@contracts'
import { model, Schema } from 'mongoose'
import validator from 'validator'

import { baseSchema } from './base.model'

const brokerSchema = new Schema<IBrokerDocument>({
  city: { type: String, required: true },
  licenseCopies: [
    {
      type: String,
      required: true,
      validate: [validator.isURL, MESSAGES.invalid('url')],
      trim: true
    }
  ],
  license: { type: String, required: true, trim: true },
  licenseExpiryDate: { type: Date, required: true, trim: true },
  watermark: { type: String, trim: true }
}).add(baseSchema)

brokerSchema.methods.toJSON = function () {
  const broker = baseSchema.methods.toJSON.call(this)
  return broker
}

export const BrokerModel = model<IBrokerDocument>(Tables.Broker, brokerSchema)
