import { CreditRequestStatusType } from '@commonTypes'
import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldCreditRequest extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  user: Types.ObjectId
  status: CreditRequestStatusType
  credits: number
  fees: number
  taxes: number
  total: number
  media: {
    fileType: string
    url: string
  }
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}
