import { z } from 'zod'

export const AmenityCreateValidation = z.object({
  name: z.string().min(2, 'Name is required'),
  image: z.string().min(2, 'Image is required'),
  code: z.string().min(2, 'Code is required')
})
export const AmenityUpdateValidation = z.object({
  name: z.string().min(2, 'Name is required').optional(),
  image: z.string().min(2, 'Image is required').optional(),
  code: z.string().min(2, 'Code is required').optional()
})
