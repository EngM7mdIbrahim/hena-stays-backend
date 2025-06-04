import { Message } from '@commonTypes'
import { Types } from 'mongoose'

import { PopulatedChatDocument } from './chat.interface'
import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface IMessageDocument
  extends BaseEntity,
    Omit<Message, '_id' | 'chat' | 'sender'> {
  chat: Types.ObjectId | string
  sender: Types.ObjectId
}

export interface PopulatedMessageDocument
  extends Omit<IMessageDocument, 'chat' | 'sender'> {
  chat: PopulatedChatDocument
  sender: PopulatedUserDocument
}

export type CreateMessageDto = Omit<Message, '_id' | 'createdAt'>
