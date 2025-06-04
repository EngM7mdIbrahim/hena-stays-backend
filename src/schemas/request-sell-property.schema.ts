import {
  AgeTypeEnum,
  CompletionEnum,
  FurnishedEnum,
  OwnerShipEnum,
  PropertyStatusEnum,
  RentDurationEnum,
  SaleTypeEnum
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AmenityModel, CategoryModel, SubCategoryModel } from '@models'
import validator from 'validator'
import { z } from 'zod'

export const RequestSellPropertyCreationValidation = z
  .object({
    title: z.string().min(1, MESSAGES.required('title')),
    description: z.string().min(1, MESSAGES.required('description')),
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
    furnished: z.nativeEnum(FurnishedEnum).optional(),
    price: z.object({
      value: z.number().positive(),
      currency: z.string().refine((value) => validator.isISO4217(value), {
        message: MESSAGES.invalid('currency code')
      }),
      duration: z.nativeEnum(RentDurationEnum).optional()
    }),
    toilets: z.number().min(0).default(0),
    living: z.number().min(0).default(0),
    bedroom: z.number().min(0).default(0),
    floors: z.number().min(0).default(0),
    age: z.number().min(0).default(0),
    ageType: z.nativeEnum(AgeTypeEnum).optional(),
    developer: z.string().optional(),
    area: z
      .object({
        plot: z.number().positive().optional(),
        builtIn: z.number().positive().optional()
      })
      .optional(),
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
    ownership: z.nativeEnum(OwnerShipEnum).optional(),
    category: z.string().refine(async (value) => {
      const category = await CategoryModel.findById(value)
      return !!category
    }),
    subCategory: z.string().refine(async (value) => {
      const subCategory = await SubCategoryModel.findById(value)
      return !!subCategory
    }),
    rating: z.number().optional()
  })
  .superRefine(async (values, ctx) => {
    if (values.type === SaleTypeEnum.Rent && !values.price.duration) {
      ctx.addIssue({
        path: ['price', 'duration'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.DURATION_REQUIRED,
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

export const RequestSellPropertyUpdateValidation = z
  .object({
    title: z.string().min(1, MESSAGES.required('title')).optional(),
    description: z.string().min(1, MESSAGES.required('description')).optional(),
    furnished: z.nativeEnum(FurnishedEnum).optional(),
    location: z.object({
      address: z.string().min(1, MESSAGES.required('address')).optional(),
      name: z.string().min(1, MESSAGES.required('location name')).optional(),
      country: z.string().min(1, MESSAGES.required('country')).optional(),
      state: z.string().optional(),
      city: z.string().min(1, MESSAGES.required('city')).optional(),
      coordinates: z
        .array(z.number())
        .min(2, MESSAGES.required('coordinates'))
        .optional()
    }),
    status: z.nativeEnum(PropertyStatusEnum).optional(),
    type: z.nativeEnum(SaleTypeEnum).optional(),
    completion: z.nativeEnum(CompletionEnum).optional(),
    price: z
      .object({
        value: z.number().positive().optional(),
        currency: z
          .string()
          .refine((value) => validator.isISO4217(value), {
            message: MESSAGES.invalid('currency code')
          })
          .optional(),
        duration: z.nativeEnum(RentDurationEnum).optional()
      })
      .optional(),
    toilets: z.number().positive().optional(),
    living: z.number().positive().optional(),
    bedroom: z.number().positive().optional(),
    floors: z.number().positive().optional(),
    age: z.number().positive().optional(),
    ageType: z.nativeEnum(AgeTypeEnum).optional(),
    developer: z.string().optional(),
    area: z
      .object({
        plot: z.number().positive().optional(),
        builtIn: z.number().positive().optional()
      })
      .optional(),
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
    ownership: z.nativeEnum(OwnerShipEnum).optional(),
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
    rating: z.number().optional()
  })
  .superRefine(async (values, ctx) => {
    if (values.type === SaleTypeEnum.Rent && !values?.price?.duration) {
      ctx.addIssue({
        path: ['price', 'duration'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.DURATION_REQUIRED,
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
