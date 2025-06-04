import { Nullable, UserViewProperties } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IPropertyDocument } from './property.interface'
import { IUserDocument } from './user.interface'

export interface IUserViewPropertiesDocument
  extends BaseEntity,
    Omit<UserViewProperties, '_id' | 'property' | 'user'> {
  property: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedUserViewPropertiesDocument
  extends Omit<IUserViewPropertiesDocument, 'property' | 'user'> {
  property: Nullable<IPropertyDocument>
  user: Nullable<IUserDocument>
}

export type CreateUserViewPropertiesDto = Omit<
  UserViewProperties,
  '_id' | 'createdAt'
>

export type IUserInteractionsModel = Model<IUserViewPropertiesDocument>
