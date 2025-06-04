import { CallRequestStatus } from '@commonTypes'
import { Tables } from '@constants'
import { ICallRequestDocument } from '@contracts'
import { model, Schema } from 'mongoose'
import validator from 'validator'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { contactWaysSchema } from './contact-ways.schema'

const callRequestSchema = new Schema<ICallRequestDocument>({
  status: {
    type: String,
    enum: Object.values(CallRequestStatus),
    default: CallRequestStatus.Pending
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Invalid email address'],
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    validate: [validator.isMobilePhone, 'Invalid phone number'],
    trim: true
  },
  whatsapp: {
    type: String,
    validate: [validator.isMobilePhone, 'Invalid whatsapp number'],
    trim: true
  },
  contactMethods: contactWaysSchema
}).add(baseSchema)

callRequestSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text',
  whatsapp: 'text'
})
callRequestSchema.methods.toJSON = function () {
  const callRequest = baseSchema.methods.toJSON.call(this)
  callRequest.contactMethods = serializeExtended(this.contactMethods)
  return callRequest
}

export const CallRequestModel = model<ICallRequestDocument>(
  Tables.CallRequest,
  callRequestSchema
)
