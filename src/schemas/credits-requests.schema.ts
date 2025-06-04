import { CreditRequestStatus, MediaTypes } from '@commonTypes'
import { z } from 'zod'

export const CreateCreditsRequestSchema = z.object({
  credits: z.number().min(75, 'Amount must be greater than 75'),
  media: z.object({
    url: z.string().url(),
    type: z.nativeEnum(MediaTypes)
  })
})

export const UpdateCreditsRequestStatusSchema = z.object({
  status: z.nativeEnum(CreditRequestStatus),
  message: z.string().optional()
})
