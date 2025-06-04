import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldRequestBuyProperty extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  description: string
  status: 'Active' | 'Not Active' | 'Processed'
  createdAt: Date
  updatedAt: Date
  type: 'Sale' | 'Rent' | 'Any'
  completion: 'Ready' | 'Off-Plan' | 'Any'
  furnished: ('Furnished' | 'Not Furnished' | 'Partially Furnished')[]
  location: {
    address: string
    country: string
    state: string
    city: string
    neighborhoods: string
    street: string
    lat: number
    lng: number
    name?: string
  }
  price: {
    min: {
      value: number
      currency: 'AED'
      duration: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null
    }
    max: {
      value: number
      currency: 'AED'
      duration: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null
    }
  }
  toilets: {
    min: number
    max: number
  }
  living: {
    min: number
    max: number
  }
  bedroom: {
    min: number
    max: number
  }
  area: {
    min: number
    max: number
  }
  age: {
    min: number
    max: number
  }
  ageType: 'days' | 'weeks' | 'months' | 'years'
  amenities: ObjectId[]
  category: ObjectId[]
  owner: ObjectId
  contact: {
    phone: string
    whatsapp: string
    email: string
  }
  enable: {
    phone: boolean
    whatsapp: boolean
    email: boolean
    truedar: boolean
  }
  deleted: boolean
  reasonDelete: string
}
