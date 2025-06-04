import { Authority, Jurisdiction, UserRole } from '@commonTypes'
import { MESSAGES } from '@constants'
import { userService } from '@services'
import validator from 'validator'
import { z } from 'zod'

export const CompanyRegisterValidation = z.object({
  license: z.string().min(3, 'License must be longer than 3 characters'),
  address: z.string().min(3, 'Address must be longer than 3 characters'),
  companyName: z.string().min(3, 'Name must be longer than 3 characters'),
  licenseCopies: z.array(z.string().url()),
  watermark: z
    .string()
    .url({ message: MESSAGES.invalid('url') })
    .optional(),
  authority: z.enum(Object.values(Authority) as [string, ...string[]]),
  city: z.string(),
  jurisdiction: z.enum(Object.values(Jurisdiction) as [string, ...string[]]),
  image: z
    .string()
    .url({ message: MESSAGES.invalid('url') })
    .optional(),
  role: z.enum([UserRole.Broker, UserRole.Company, UserRole.User])
})

export const BrokerRegisterValidation = z.object({
  license: z.string().min(3, 'License must be longer than 3 characters'),
  licenseExpiryDate: z
    .string()
    .refine((dateString) => !isNaN(Date.parse(dateString)), {
      message: MESSAGES.invalid('date')
    }), // date(),
  licenseCopies: z.array(z.string().url()),
  watermark: z
    .string()
    .url({ message: MESSAGES.invalid('url') })
    .optional(),
  city: z.string(),
  image: z
    .string()
    .url({ message: MESSAGES.invalid('url') })
    .optional(),
  role: z.enum([UserRole.Broker, UserRole.Company, UserRole.User])
})

export const UserRegisterValidation = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be longer than 3 characters')
      .refine(
        async (value) => {
          const user = await userService.readOne({
            username: value.toLowerCase()
          })
          return !user
        },
        {
          message: MESSAGES.AUTH.USERNAME_EXISTS
        }
      ),
    name: z.string().min(3, 'Name must be longer than 3 characters'),
    password: z.string().min(6, 'Password must be longer than 6 characters'),
    confirmPassword: z.string(),
    email: z
      .string()
      .email({ message: 'send a valid email' })
      .refine(
        async (value) => {
          const user = await userService.readOne({ email: value.toLowerCase() })
          return !user
        },
        {
          message: MESSAGES.AUTH.USER_EXISTS
        }
      ),
    whatsapp: z
      .string()
      .refine((value) => validator.isMobilePhone(value), {
        message: MESSAGES.invalid('whatsapp')
      })
      .optional(),
    phone: z
      .string()
      .refine((value) => validator.isMobilePhone(value), {
        message: MESSAGES.invalid('phone')
      })
      .optional(),
    image: z
      .string()
      .url({ message: MESSAGES.invalid('url') })
      .optional(),
    role: z.enum([UserRole.Broker, UserRole.Company, UserRole.User])
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'], // Specify the field where the error should appear
        message: MESSAGES.AUTH.PASSWORD_MISMATCH,
        code: 'custom'
      })
    }
  })

export const SendOTPValidation = z.object({
  email: z.string().email({ message: MESSAGES.invalid('email') })
})

export const VerifyOTPValidation = z.object({
  email: z.string().email({ message: MESSAGES.invalid('email') }),
  otp: z.string().min(4, MESSAGES.invalid('otp'))
})

export const ForgetPasswordValidation = z.object({
  email: z.string().email({ message: MESSAGES.invalid('email') })
})

export const ResetPasswordValidation = z
  .object({
    password: z.string().min(6, MESSAGES.invalid('password')),
    token: z.string(),
    confirmPassword: z.string()
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'], // Specify the field where the error should appear
        message: MESSAGES.AUTH.PASSWORD_MISMATCH,
        code: 'custom'
      })
    }
  })

export const QuickGuestRegister = z.object({
  email: z.string().email({ message: MESSAGES.invalid('email') }),
  name: z.string().min(3, MESSAGES.invalid('name')),
  phone: z.string().refine((value) => validator.isMobilePhone(value), {
    message: MESSAGES.invalid('phone')
  })
})
