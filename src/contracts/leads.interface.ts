import { Leads, Nullable } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IPropertyDocument } from './property.interface'
import { IUserDocument } from './user.interface'

export interface ILeadsDocument
  extends BaseEntity,
    Omit<Leads, '_id' | 'property' | 'user'> {
  property: Types.ObjectId
  user: Nullable<Types.ObjectId>
}

export interface PopulatedLeadsDocument
  extends Omit<ILeadsDocument, 'property' | 'user'> {
  property: Nullable<IPropertyDocument>
  user: Nullable<IUserDocument>
}

export type CreateLeadsDto = Omit<Leads, '_id' | 'createdAt'>

export type ILeadsModel = Model<ILeadsDocument>
