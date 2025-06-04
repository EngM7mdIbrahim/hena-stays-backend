import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const CreatePropertySaveValidation = z.object({
  property: MongoIdSchema
})

export const DeletePropertySaveValidation = z.object({
  id: MongoIdSchema
})
