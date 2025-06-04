import { ChatTypes } from '@commonTypes'
import { Tables } from '@constants'
import { IChatDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const chatSchema = new Schema<IChatDocument>({
  users: [{ type: Schema.Types.ObjectId, ref: Tables.User, required: true }],
  type: { type: String, enum: Object.values(ChatTypes), required: true }
}).add(baseSchema)

chatSchema.methods.toJSON = function () {
  const chat = baseSchema.methods.toJSON.call(this)
  chat.users = chat.users.map((user: any) => serializeExtended(user))
  return chat
}

export const ChatModel = mongoose.model<IChatDocument>(Tables.Chat, chatSchema)
