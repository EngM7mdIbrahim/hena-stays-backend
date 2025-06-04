import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldChat extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  users: Types.ObjectId[]
  type: 'Normal' | 'Community'
  deleted: boolean
  assistant?: string
  support?: boolean
  createdAt: Date
  updatedAt: Date
}
