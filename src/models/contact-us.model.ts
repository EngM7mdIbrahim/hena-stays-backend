import { MESSAGES, Tables } from '@constants'
import { IContactUsDocument } from '@contracts'
import { model, Schema } from 'mongoose'
import { isEmail } from 'validator'

import { baseSchema } from './base.model'

const contactUsSchema = new Schema<IContactUsDocument>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    validate: [isEmail, MESSAGES.invalid('email')],
    trim: true,
    lowercase: true
  },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true }
}).add(baseSchema)

contactUsSchema.methods.toJSON = function () {
  const contactUs = baseSchema.methods.toJSON.call(this)
  return contactUs
}
export const ContactUsModel = model<IContactUsDocument>(
  Tables.ContactUs,
  contactUsSchema
)
