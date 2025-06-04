import { CategoryModel, SubCategoryModel } from '@models'
import { z } from 'zod'

export const SubCategoryCreateValidation = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.string().refine(async (value) => {
    const category = await CategoryModel.findById(value)
    return !!category
  }),
  code: z.string().min(2, 'Code is required'),
  sortOrder: z
    .number()
    .min(0, 'Sort order is required')
    .refine(async (value) => {
      const subCategory = await SubCategoryModel.findOne({ sortOrder: value })
      return !subCategory
    }, 'Sort order must be unique')
})
export const SubCategoryUpdateValidation = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  category: z
    .string()
    .refine(async (value) => {
      const category = await CategoryModel.findById(value)
      return !!category
    })
    .optional(),
  code: z.string().min(2, 'Code is required').optional(),
  sortOrder: z
    .number()
    .min(0, 'Sort order is required')
    .optional()
    .refine(async (value) => {
      if (!value) return true
      const subCategory = await SubCategoryModel.findOne({ sortOrder: value })
      return !subCategory
    })
})
