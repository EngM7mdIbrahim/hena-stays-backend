import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldCategory extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId

  name: string
  type: 'Commercial' | 'Residential'
  deleted: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
