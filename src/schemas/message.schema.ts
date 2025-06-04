import { MediaTypes } from '@commonTypes'
import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const MessageCreationSchemaValidation = z.object({
  chatId: MongoIdSchema,
  text: z.string(),
  media: z
    .array(
      z.object({
        type: z.enum(Object.values(MediaTypes) as [string, ...string[]]),
        url: z.string().url('Invalid URL format')
      })
    )
    // .min(1, 'At least one media item is required')
    .optional()
})

export const MessageUpdateSchemaValidation = z.object({
  text: z.string().optional(),
  media: z
    .array(
      z.object({
        type: z.enum(Object.values(MediaTypes) as [string, ...string[]]),
        url: z.string().url('Invalid URL format')
      })
    )
    .optional()
  // .min(1, 'At least one media item is required')
})
