import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldNotifications extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  title: string
  body: string
  image?: string
  link: string
  seen: boolean
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}
