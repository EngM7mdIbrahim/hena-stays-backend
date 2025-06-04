import { RecommendationTypeEnumType } from '@commonTypes'
import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldProperty extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  name: string
  description: string
  address: string
  location: {
    address: string
    country: string
    state: string
    city: string
    neighborhood: string
    street: string
    lat: number
    lng: number
  }
  type: 'Sale' | 'Rent'
  status: 'Sold' | 'Draft' | 'Rented' | 'Sale' | 'Pending'
  media: {
    type: 'image' | 'video'
    url: string
  }[]
  request: {
    type: 'Property'
    status: 'Pending' | 'Approved' | 'Rejected'
    action: 'Sell' | 'Buy'
  }
  ignored: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
  completion: 'Ready' | 'OffPlan'
  furnished: 'Furnished' | 'Not Furnished' | 'Partially Furnished'
  price: {
    value: number
    currency: 'AED'
    duration: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null
  }
  rooms: {
    toilets: number
    living: number
    bedroom: number
    total: number
  }
  floors: {
    number: string
    total: number
  }
  area: {
    plot: number
    builtIn: number
  }
  age: number
  ageType: string
  developer: string
  permit: {
    number: string
    DED: string
    RERA: string
    BRN: string
    tarkheesi: string
  }
  amenities: {
    base: Types.ObjectId[]
    other: string[]
  }
  ownership: 'Individual' | 'Freehold' | 'Corporate'
  owner: Types.ObjectId
  deleted: boolean
  reasonDelete: string
  category: Types.ObjectId
  clicks: {
    whatsapp: number
    email: number
    phone: number
  }
  views: number
  recommended: RecommendationTypeEnumType
  project: Types.ObjectId
  recommendationExpiresAt: Date
  xmlMetaData: {
    lastUpdated: Date
    referenceNumber: string
  }
}
