import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldAmenity extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  name: string
  image: string
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}
