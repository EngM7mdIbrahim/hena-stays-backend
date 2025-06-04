import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const CreatePostSaveValidation = z.object({
  post: MongoIdSchema
})

export const DeletePostSaveValidation = z.object({
  id: MongoIdSchema
})
