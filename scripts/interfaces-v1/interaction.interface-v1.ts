import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldInteractions extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  user: Types.ObjectId
  property: Types.ObjectId
  type: 'Views' | 'Clicks' | 'Search' | 'Saves'
  search: {
    text: string
    type: 'Property' | 'Location'
  }
  minutes: number
  location: {
    address: string
    lat: number
    lng: number
  }
  deleted: boolean
  fake: boolean
  createdAt: Date
  updatedAt: Date
}
