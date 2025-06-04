import { Chat } from '@commonTypes'
import { Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface IChatDocument extends BaseEntity, Omit<Chat, '_id' | 'users'> {
  users: Types.ObjectId[]
}

export interface IChatModel {
  findOrCreateSupportChat(userId: Types.ObjectId): Promise<IChatDocument>
}

export interface PopulatedChatDocument extends Omit<IChatDocument, 'users'> {
  users: PopulatedUserDocument[]
}

export type CreateChatDto = Pick<Chat, 'users' | 'type'>
