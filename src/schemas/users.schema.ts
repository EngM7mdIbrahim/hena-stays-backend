import { UserRole, UserStatus } from '@commonTypes'
import validator from 'validator'
import { z } from 'zod'

const MainCreationValidation = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  role: z.nativeEnum(UserRole),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z
    .string()
    .refine((value) => validator.isMobilePhone(value), {
      message: 'Invalid phone number'
    })
    .optional(),
  whatsapp: z
    .string()
    .refine((value) => validator.isMobilePhone(value), {
      message: 'Invalid whatsapp number'
    })
    .optional()
})

export const UserAdminCreationValidation = MainCreationValidation.extend({
  //   image: z.string().url({ message: 'Invalid image url' }).optional(),
  status: z.enum([UserStatus.Active, UserStatus.Blocked])
})

export const UserCompanyCreationValidation = MainCreationValidation.extend({
  role: z.enum([UserRole.Agent, UserRole.CompanyAdmin])
})
