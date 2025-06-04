import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldFollow extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  follower: Types.ObjectId
  following: Types.ObjectId
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}
