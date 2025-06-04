import { MediaTypes } from '@commonTypes'
import { z } from 'zod'

import { LocationCreateSchema, LocationUpdateSchema } from './location.schema'

export const PostCreationValidation = z.object({
  description: z.string().min(1, 'Description is required'),
  location: LocationCreateSchema,
  media: z
    .array(
      z.object({
        type: z.nativeEnum(MediaTypes),
        url: z.string().url('Invalid URL format')
      })
    )
    .min(1, 'At least one media item is required')
})

export const PostUpdateValidation = z.object({
  description: z.string().min(1, 'Description is required').optional(),
  location: LocationUpdateSchema,
  media: z
    .array(
      z.object({
        type: z.nativeEnum(MediaTypes),
        url: z.string().url('Invalid URL format')
      })
    )
    .min(1, 'At least one media item is required')
    .optional()
})
