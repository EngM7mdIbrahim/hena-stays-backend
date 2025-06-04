import { CallRequestStatus } from '@commonTypes'
import { MESSAGES } from '@constants'
import validator from 'validator'
import { z } from 'zod'

const CallRequestBaseSchema = z.object({
  email: z.string().email(MESSAGES.invalid('email')),
  name: z.string().min(3, MESSAGES.required('name')),
  phone: z.string().refine((value) => validator.isMobilePhone(value), {
    message: MESSAGES.invalid('phone')
  }),
  whatsapp: z.string().refine((value) => validator.isMobilePhone(value), {
    message: MESSAGES.invalid('whatsapp')
  }),
  contactMethods: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    whatsapp: z.boolean(),
    truedar: z.boolean()
  })
})

export const CallRequestCreationValidation = CallRequestBaseSchema

export const CallRequestUpdateValidation = CallRequestBaseSchema.partial()

export const UpdateCallRequestStatusValidation = z.object({
  status: z.nativeEnum(CallRequestStatus)
})

export const DeleteCallRequestValidation = z.object({
  id: z.string()
})
