import { z } from 'zod'

export const CategoryCreateValidation = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required')
})
export const CategoryUpdateValidation = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  code: z.string().min(2, 'Code is required').optional()
})
