import { CategoriesCodes } from '@commonTypes'
import { Tables } from '@constants'
import { ICategoryDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { baseSchema } from './base.model'

const categorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, enum: CategoriesCodes }
}).add(baseSchema)

export const CategoryModel = model<ICategoryDocument>(
  Tables.Category,
  categorySchema
)
