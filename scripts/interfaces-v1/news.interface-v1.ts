import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldNews extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  title: string
  subTitle: string
  image?: string
  reference: string
  author: string
  content: string
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}
