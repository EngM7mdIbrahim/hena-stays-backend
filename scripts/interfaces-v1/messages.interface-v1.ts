import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldMessage extends Omit<HydratedDocument<ObjectId>, 'text'> {
  _id: Types.ObjectId
  sender: Types.ObjectId
  receiver?: Types.ObjectId
  chat: Types.ObjectId
  text: string
  images: string[]
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}
