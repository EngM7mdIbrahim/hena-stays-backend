import { ChatTypes } from '@commonTypes'
import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const ChatCreationValidation = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ChatTypes.NORMAL),
    user: MongoIdSchema
  }),
  z.object({
    type: z.literal(ChatTypes.SUPPORT)
  })
])
