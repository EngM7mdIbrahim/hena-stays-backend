import { RentDurationEnum } from '@commonTypes'
import { env } from '@config'
import { MESSAGES } from '@constants'
import { Schema } from 'mongoose'
import validator from 'validator'

export const priceSchema = new Schema({
  value: { type: Number, required: true },
  currency: {
    type: String,
    validate: [validator.isISO4217, MESSAGES.invalid('currency code')],
    default: env.CURRENCY.toUpperCase()
  },
  duration: {
    type: String,
    enum: [...Object.values(RentDurationEnum), null]
  }
})

priceSchema.methods.toJSON = function () {
  const price = this.toObject()
  delete price._id
  return price
}
