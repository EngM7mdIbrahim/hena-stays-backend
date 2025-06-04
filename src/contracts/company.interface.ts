import {
  AuthorityType,
  Company,
  JurisdictionType,
  Nullable
} from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface ICompanyDocument
  extends BaseEntity,
    Omit<Company, '_id' | 'owner'> {
  owner: Types.ObjectId
  name: string
  authority: AuthorityType //enum
  city: string
  jurisdiction: JurisdictionType // enum
  address: string
  licenseCopies: string[]
  licenseExpiryDate: Date
  license: string
  watermark?: string
}

export interface PopulatedCompanyDocument
  extends Omit<ICompanyDocument, 'owner'> {
  owner: Nullable<PopulatedUserDocument>
}

export type CreateCompanyDto = Omit<Company, '_id' | 'owner' | 'createdAt'>

export type ICompanyModel = Model<ICompanyDocument>
