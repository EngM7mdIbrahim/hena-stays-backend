import { MediaTypes } from '@commonTypes'
import { z } from 'zod'

export const BlogCreationValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  tableOfContents: z.string().min(1, 'Table of contents is required'),
  media: z
    .array(
      z.object({
        type: z.nativeEnum(MediaTypes),
        url: z.string().url('Invalid URL format')
      })
    )
    .min(1, 'At least one media item is required')
})
export const BlogUpdateValidation = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  tableOfContents: z
    .string()
    .min(1, 'Table of contents is required')
    .optional(),
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
