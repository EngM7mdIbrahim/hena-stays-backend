import { Broker } from '@commonTypes'
import { Model } from 'mongoose'

import { BaseEntity } from './db.interface'

export interface IBrokerDocument extends BaseEntity, Omit<Broker, '_id'> {
  city: string
  licenseCopies: string[]
  licenseExpiryDate: Date
  license: string
  watermark?: string
}
export type PopulatedBrokerDocument = IBrokerDocument
export type CreateBrokerDto = Omit<Broker, '_id' | 'createdAt'>

export type IBrokerModel = Model<IBrokerDocument>
