import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldComment extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  description: string
  user: Types.ObjectId
  post: Types.ObjectId
  likes: number
  deleted: boolean
  fake: boolean
  createdAt: Date
  updatedAt: Date
}
