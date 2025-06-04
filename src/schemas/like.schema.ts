import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const likeCreationValidation = z
  .object({
    post: z.string().optional(),
    comment: z.string().optional()
  })
  .refine((data) => data.post || data.comment, {
    message: 'Either post or comment must be provided',
    path: ['post', 'comment']
  })

export const DeleteLikeValidation = z.object({
  id: MongoIdSchema
})
