import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldPost extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  description: string
  location: {
    address: string
    name: string
    country: string
    state: string
    city: string
    lat: number
    lng: number
  }
  type: 'Blog' | 'Media'
  media: {
    type: 'image' | 'video'
    url: string
  }[]
  user: Types.ObjectId
  likes: number
  saves: number
  comments: number
  fake: boolean
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}
