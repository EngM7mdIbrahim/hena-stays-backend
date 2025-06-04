import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const CommentCreationValidation = z.object({
  description: z.string().min(1, 'Description is required'),
  post: MongoIdSchema
})
export const CommentUpdateValidation = z.object({
  description: z.string().min(1, 'Description is required')
})
