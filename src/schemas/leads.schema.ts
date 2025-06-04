import { LeadsContactsTypesEnum, LeadsStatusEnum } from '@commonTypes'
import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const CreateLeadValidation = z.object({
  contactType: z.nativeEnum(LeadsContactsTypesEnum),
  property: MongoIdSchema
})

export const UpdateLeadValidation = z.object({
  contactType: z.nativeEnum(LeadsContactsTypesEnum).optional(),
  property: MongoIdSchema.optional(),
  status: z.nativeEnum(LeadsStatusEnum).optional()
})
