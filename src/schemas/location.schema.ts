import { MESSAGES } from '@constants'
import { z } from 'zod'

export const LocationCreateSchema = z
  .object({
    address: z.string().min(1, MESSAGES.required('address')),
    name: z.string().min(1, MESSAGES.required('location name')),
    country: z.string().min(1, MESSAGES.required('country')),
    state: z.string().optional(),
    city: z.string().min(1, MESSAGES.required('city')),
    coordinates: z.array(z.number()).min(2, MESSAGES.required('coordinates'))
  })
  .required()

export const LocationUpdateSchema = LocationCreateSchema.partial().optional()
