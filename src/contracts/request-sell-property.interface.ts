import { Nullable, RequestSellProperty, User } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { ICategoryDocument } from './category.interface'
import { BaseEntity } from './db.interface'
import { ISubCategoryDocument } from './subCategory.interface'

export interface IRequestSellPropertyDocument
  extends BaseEntity,
    Omit<
      RequestSellProperty,
      '_id' | 'category' | 'subCategory' | 'createdBy'
    > {
  category: Types.ObjectId
  subCategory: Types.ObjectId
  createdBy: Types.ObjectId
}

export interface PopulatedRequestSellPropertyDocument
  extends Omit<
    IRequestSellPropertyDocument,
    'category' | 'subCategory' | 'createdBy'
  > {
  category: Nullable<ICategoryDocument>
  subCategory: Nullable<ISubCategoryDocument>
  createdBy: Nullable<User>
}

export type CreateRequestSellPropertyDto = Omit<
  RequestSellProperty,
  '_id' | 'createdAt'
>

export type IRequestSellPropertyModel = Model<IRequestSellPropertyDocument>
