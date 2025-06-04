import { Nullable } from '@commonTypes'
import { Document, ObjectId } from 'mongoose'

export interface BaseEntity extends Document {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
