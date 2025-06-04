import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldLikes extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  user: Types.ObjectId
  post: Types.ObjectId
  comment: Types.ObjectId
  deleted: boolean
  fake: boolean
  createdAt: Date
  updatedAt: Date
}
