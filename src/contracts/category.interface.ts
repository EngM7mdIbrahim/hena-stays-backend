import { Category } from '@commonTypes'
import { Model } from 'mongoose'

import { BaseEntity } from './db.interface'

export interface ICategoryDocument extends BaseEntity, Omit<Category, '_id'> {}

export type PopulatedCategoryDocument = ICategoryDocument

export type ICategoryModel = Model<ICategoryDocument>
export type CreateCategoryDto = Omit<Category, '_id' | 'createdAt'>
