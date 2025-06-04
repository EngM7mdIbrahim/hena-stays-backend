import { z } from 'zod'

export const CreateContactUsSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  subject: z.string().min(3).max(255),
  message: z.string().min(10)
})
