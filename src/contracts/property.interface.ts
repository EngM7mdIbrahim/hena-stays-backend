import { Company, Nullable, Project, Property, User } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { ICategoryDocument } from './category.interface'
import { BaseEntity } from './db.interface'
import { ISubCategoryDocument } from './subCategory.interface'

export interface IPropertyDocument
  extends BaseEntity,
    Omit<
      Property,
      '_id' | 'category' | 'subCategory' | 'createdBy' | 'company' | 'project'
    > {
  category: Types.ObjectId
  subCategory: Types.ObjectId
  createdBy: Types.ObjectId
  company: Types.ObjectId
  project: Types.ObjectId
  xmlMetaData: {
    lastUpdated: Date
    referenceNumber: string
  }
  meta: {
    recommendationSortingOrder: number
  }
}

export interface PopulatedPropertyDocument
  extends Omit<
    IPropertyDocument,
    'category' | 'subCategory' | 'company' | 'createdBy' | 'project'
  > {
  category: Nullable<ICategoryDocument>
  subCategory: Nullable<ISubCategoryDocument>
  company: Nullable<Company>
  createdBy: Nullable<User>
  project: Nullable<Project>
}

export type CreatePropertyDto = Omit<Property, '_id' | 'createdAt'>

export type IPropertyModel = Model<IPropertyDocument>
