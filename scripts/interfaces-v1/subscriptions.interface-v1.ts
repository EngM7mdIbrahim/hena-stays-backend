import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldSubscription extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  user: Types.ObjectId
  credits: number
  deletedAt: Date
  createdAt: Date
  updatedAt: Date
}
