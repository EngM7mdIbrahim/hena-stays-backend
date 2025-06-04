import {
  CompletionEnum,
  FurnishedEnum,
  PropertyStatusEnum,
  RentDurationEnum,
  SaleTypeEnum
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AmenityModel, CategoryModel, SubCategoryModel } from '@models'
import validator from 'validator'
import { z } from 'zod'

import { numberRange } from './numberRange.schema'

export const RequestBuyPropertyCreationValidation = z
  .object({
    location: z.object({
      address: z.string().min(1, MESSAGES.required('address')),
      name: z.string().min(1, MESSAGES.required('location name')),
      country: z.string().min(1, MESSAGES.required('country')),
      state: z.string().optional(),
      city: z.string().min(1, MESSAGES.required('city')),
      coordinates: z.array(z.number()).min(2, MESSAGES.required('coordinates'))
    }),
    type: z.nativeEnum(SaleTypeEnum),
    completion: z.nativeEnum(CompletionEnum),
    furnished: z.array(z.nativeEnum(FurnishedEnum)).optional(),
    price: z
      .object({
        from: z.number().positive(),
        to: z.number().positive(),
        currency: z.string().refine((value) => validator.isISO4217(value), {
          message: MESSAGES.invalid('currency code')
        }),
        duration: z.nativeEnum(RentDurationEnum).optional()
      })
      .optional(),
    toilets: numberRange(0, 7).optional(),
    living: numberRange(0, 7).optional(),
    bedroom: numberRange(0, 7).optional(),
    age: numberRange(0, 7).optional(),
    area: numberRange(0, Number.MAX_SAFE_INTEGER).optional(),
    amenities: z
      .object({
        basic: z.array(
          z.string().refine(async (value) => {
            const amenity = await AmenityModel.findById(value)
            return !!amenity
          })
        ),
        other: z.array(z.string())
      })
      .optional(),
    category: z.string().refine(async (value) => {
      const category = await CategoryModel.findById(value)
      return !!category
    }),
    subCategory: z.string().refine(async (value) => {
      const subCategory = await SubCategoryModel.findById(value)
      return !!subCategory
    }),
    contactWays: z.object({
      email: z.boolean(),
      phone: z.boolean(),
      whatsapp: z.boolean(),
      truedar: z.boolean()
    }),
    contactInfo: z.object({
      name: z.string().min(1, MESSAGES.required('name')),
      email: z.string().email(MESSAGES.invalid('email')),
      phone: z.string().min(1, MESSAGES.required('phone')),
      whatsapp: z.string().min(1, MESSAGES.required('whatsapp'))
    })
  })
  .superRefine(async (values, ctx) => {
    if (values.type === SaleTypeEnum.Rent && !values.price?.duration) {
      ctx.addIssue({
        path: ['price', 'duration'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.DURATION_REQUIRED,
        code: 'custom'
      })
    }
    if (
      values.price?.from &&
      values.price?.to &&
      values.price.from > values.price.to
    ) {
      ctx.addIssue({
        path: ['price', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('price'),
        code: 'custom'
      })
    }
    if (
      values.toilets?.to &&
      values.toilets?.from &&
      values.toilets?.from > values.toilets?.to
    ) {
      ctx.addIssue({
        path: ['toilets', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('toilets'),
        code: 'custom'
      })
    }
    if (
      values.living?.to &&
      values.living?.from &&
      values.living.from > values.living.to
    ) {
      ctx.addIssue({
        path: ['living', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('living'),
        code: 'custom'
      })
    }
    if (
      values.bedroom?.to &&
      values.bedroom?.from &&
      values.bedroom.from > values.bedroom.to
    ) {
      ctx.addIssue({
        path: ['bedroom', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('bedroom'),
        code: 'custom'
      })
    }
    if (values.age?.to && values.age?.from && values.age.from > values.age.to) {
      ctx.addIssue({
        path: ['age', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('age'),
        code: 'custom'
      })
    }
    const subCategory = await SubCategoryModel.findById(values.subCategory)
    if (String(subCategory?.category) !== values.category) {
      ctx.addIssue({
        path: ['subCategory', 'category'], // Specify the field where the error should appear
        message: MESSAGES.SUB_CATEGORIES.NOT_BELONGS_TO_CATEGORY,
        code: 'custom'
      })
    }
  })

export const RequestBuyPropertyUpdateValidation = z
  .object({
    location: z
      .object({
        address: z.string().min(1, MESSAGES.required('address')),
        name: z.string().min(1, MESSAGES.required('location name')),
        country: z.string().min(1, MESSAGES.required('country')),
        state: z.string(),
        city: z.string().min(1, MESSAGES.required('city')),
        coordinates: z
          .array(z.number())
          .min(2, MESSAGES.required('coordinates'))
      })
      .optional(),
    status: z.nativeEnum(PropertyStatusEnum).optional(),
    type: z.nativeEnum(SaleTypeEnum).optional(),
    completion: z.nativeEnum(CompletionEnum).optional(),
    furnished: z.array(z.nativeEnum(FurnishedEnum)).optional(),
    price: z
      .object({
        from: z.number().positive(),
        to: z.number().positive(),
        currency: z.string().refine((value) => validator.isISO4217(value), {
          message: MESSAGES.invalid('currency code')
        }),
        duration: z.nativeEnum(RentDurationEnum).optional()
      })
      .optional(),
    toilets: numberRange(0, 7).optional(),
    living: numberRange(0, 7).optional(),
    bedroom: numberRange(0, 7).optional(),
    age: numberRange(0, 7).optional(),
    area: numberRange(0, Number.MAX_SAFE_INTEGER).optional(),
    amenities: z
      .object({
        basic: z.array(
          z.string().refine(async (value) => {
            const amenity = await AmenityModel.findById(value)
            return !!amenity
          })
        ),
        other: z.array(z.string())
      })
      .optional(),
    category: z
      .string()
      .refine(async (value) => {
        const category = await CategoryModel.findById(value)
        return !!category
      })
      .optional(),
    subCategory: z
      .string()
      .refine(async (value) => {
        const subCategory = await SubCategoryModel.findById(value)
        return !!subCategory
      })
      .optional(),
    contactWays: z
      .object({
        email: z.boolean(),
        phone: z.boolean(),
        whatsapp: z.boolean(),
        truedar: z.boolean()
      })
      .optional()
  })
  .superRefine(async (values, ctx) => {
    if (values.type === SaleTypeEnum.Rent && !values?.price?.duration) {
      ctx.addIssue({
        path: ['price', 'duration'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.DURATION_REQUIRED,
        code: 'custom'
      })
    }
    if (
      values.price?.from &&
      values.price?.to &&
      values.price.from > values.price.to
    ) {
      ctx.addIssue({
        path: ['price', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('price'),
        code: 'custom'
      })
    }
    if (
      values.toilets?.to &&
      values.toilets?.from &&
      values.toilets?.from > values.toilets?.to
    ) {
      ctx.addIssue({
        path: ['toilets', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('toilets'),
        code: 'custom'
      })
    }
    if (
      values.living?.to &&
      values.living?.from &&
      values.living.from > values.living.to
    ) {
      ctx.addIssue({
        path: ['living', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('living'),
        code: 'custom'
      })
    }
    if (
      values.bedroom?.to &&
      values.bedroom?.from &&
      values.bedroom.from > values.bedroom.to
    ) {
      ctx.addIssue({
        path: ['bedroom', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('bedroom'),
        code: 'custom'
      })
    }
    if (values.age?.to && values.age?.from && values.age.from > values.age.to) {
      ctx.addIssue({
        path: ['age', 'to'], // Specify the field where the error should appear
        message: MESSAGES.MinimumGreaterThanMaximum('age'),
        code: 'custom'
      })
    }
    if (values.subCategory && values.category) {
      const subCategory = await SubCategoryModel.findById(values.subCategory)
      if (String(subCategory?.category) !== values.category) {
        ctx.addIssue({
          path: ['subCategory', 'category'], // Specify the field where the error should appear
          message: MESSAGES.SUB_CATEGORIES.NOT_BELONGS_TO_CATEGORY,
          code: 'custom'
        })
      }
    }
  })

export const DeleteRequestBuyPropertyValidation = z.object({
  reasonDelete: z.string().min(1, MESSAGES.required('reason delete'))
})
