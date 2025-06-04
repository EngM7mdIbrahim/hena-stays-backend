import { Tables } from '@constants'
import { IMessageDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { mediaSchema } from './media.schema'

const messageSchema = new Schema<IMessageDocument>({
  chat: {
    type: Schema.Types.ObjectId,
    ref: Tables.Chat,
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true
  },
  media: [mediaSchema],
  text: {
    type: String,
    default: ''
  },
  readBy: [{ type: Schema.Types.ObjectId, ref: Tables.User }]
}).add(baseSchema)

messageSchema.methods.toJSON = function () {
  const message = baseSchema.methods.toJSON.call(this)
  message.sender = serializeExtended(this.sender)
  message.chat = serializeExtended(this.chat)
  return message
}

export const MessageModel = model<IMessageDocument>(
  Tables.Message,
  messageSchema
)
