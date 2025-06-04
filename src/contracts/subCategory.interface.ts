import { Nullable, SubCategory } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { ICategoryDocument } from './category.interface'
import { BaseEntity } from './db.interface'

export interface ISubCategoryDocument
  extends BaseEntity,
    Omit<SubCategory, '_id' | 'category'> {
  category: Types.ObjectId
}

export interface PopulatedSubCategoryDocument
  extends Omit<ISubCategoryDocument, 'category'> {
  category: Nullable<ICategoryDocument>
}

export type CreateSubCategoryDto = Omit<SubCategory, '_id' | 'createdAt'>

export type ISubCategoryModel = Model<ISubCategoryDocument>
