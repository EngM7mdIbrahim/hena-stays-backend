import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldPostSave extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  post: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}
