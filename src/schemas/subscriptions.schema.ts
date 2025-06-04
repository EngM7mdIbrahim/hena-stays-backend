import { z } from 'zod'

export const updateSubscriptionSchema = z.object({
  credits: z.number()
})
