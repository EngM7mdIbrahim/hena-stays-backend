import { Tables } from '@constants'
import { ISubCategoryDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { baseSchema } from './base.model'

const subCategorySchema = new Schema<ISubCategoryDocument>({
  name: { type: String, required: true },
  category: {
    type: Schema.Types.ObjectId,
    ref: Tables.Category,
    required: true
  },
  code: { type: String, required: true },
  sortOrder: { type: Number, required: true, unique: true }
}).add(baseSchema)

export const SubCategoryModel = model<ISubCategoryDocument>(
  Tables.SubCategory,
  subCategorySchema
)
