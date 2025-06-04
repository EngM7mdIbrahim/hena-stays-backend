import { z } from 'zod'

export const createSessionCreditsSchema = z.object({
  credits: z.number().min(75, 'Amount must be greater than 75'),
  returnUrl: z.string().url()
})

export const getTransactionsSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['complete', 'expired', 'open']).optional(),
  starting_after: z.string().optional(),
  ending_before: z.string().optional(),
  limit: z.number().optional()
})
