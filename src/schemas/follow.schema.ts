import { z } from 'zod'

import { MongoIdSchema } from './mongo-id.schema'

export const FollowCreationSchema = z.object({
  following: MongoIdSchema
})

export const FollowDeletionSchema = FollowCreationSchema
