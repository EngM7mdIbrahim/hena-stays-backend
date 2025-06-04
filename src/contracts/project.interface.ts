import { Nullable, Project, ValueRange } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { ICategoryDocument } from './category.interface'
import { PopulatedCompanyDocument } from './company.interface'
import { BaseEntity } from './db.interface'
import { PopulatedSubCategoryDocument } from './subCategory.interface'
import { PopulatedUserDocument } from './user.interface'

export interface IProjectDocument
  extends BaseEntity,
    Omit<Project, '_id' | 'owner' | 'company' | 'units'> {
  owner: Types.ObjectId
  company: Types.ObjectId
  units: {
    category: Types.ObjectId
    subCategory: Types.ObjectId
    area: ValueRange<number>
    price: ValueRange<number>
  }[]
}

export interface PopulatedProjectDocument
  extends Omit<IProjectDocument, 'owner' | 'company' | 'units'> {
  owner: Nullable<PopulatedUserDocument>
  company: Nullable<PopulatedCompanyDocument>
  units: {
    category: Nullable<ICategoryDocument>
    subCategory: Nullable<PopulatedSubCategoryDocument>
    area: ValueRange<number>
    price: ValueRange<number>
  }[]
}

export type CreateProjectDto = Omit<
  Project,
  '_id' | 'createdAt' | 'units' | 'recommended' | 'startingPrice'
>
export type IProjectModel = Model<IProjectDocument>
