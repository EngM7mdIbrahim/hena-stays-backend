import { Nullable, RequestBuyProperty, User } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { ICategoryDocument } from './category.interface'
import { BaseEntity } from './db.interface'
import { ISubCategoryDocument } from './subCategory.interface'

export interface IRequestBuyPropertyDocument
  extends BaseEntity,
    Omit<RequestBuyProperty, '_id' | 'category' | 'subCategory' | 'createdBy'> {
  category: Types.ObjectId
  subCategory: Types.ObjectId
  createdBy: Types.ObjectId
}

export interface PopulatedRequestBuyPropertyDocument
  extends Omit<
    IRequestBuyPropertyDocument,
    'category' | 'subCategory' | 'createdBy'
  > {
  category: Nullable<ICategoryDocument>
  subCategory: Nullable<ISubCategoryDocument>
  createdBy: Nullable<User>
}

export type CreateRequestBuyPropertyDto = Omit<
  RequestBuyProperty,
  '_id' | 'createdAt'
>

export type IRequestBuyPropertyModel = Model<IRequestBuyPropertyDocument>
