import {
  AgeTypeEnum,
  CompletionEnum,
  FurnishedEnum,
  MediaTypes,
  OwnerShipEnum,
  PropertyStatusEnum,
  RecommendationTypeEnum,
  RentDurationEnum,
  SaleTypeEnum
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AmenityModel,
  CategoryModel,
  ProjectModel,
  SubCategoryModel
} from '@models'
import { propertyService } from '@services'
import validator from 'validator'
import { z } from 'zod'

import { LocationCreateSchema, LocationUpdateSchema } from './location.schema'
import { MongoIdSchema } from './mongo-id.schema'

export const PropertyCreationValidation = z
  .object({
    title: z.string().min(1, MESSAGES.required('title')),
    description: z.string().min(1, MESSAGES.required('description')),
    furnished: z.nativeEnum(FurnishedEnum).optional(),
    location: LocationCreateSchema,
    media: z
      .array(
        z.object({
          type: z.nativeEnum(MediaTypes),
          url: z.string().url('Invalid URL format')
        })
      )
      .min(1, 'At least one media item is required'),
    type: z.nativeEnum(SaleTypeEnum),
    completion: z.nativeEnum(CompletionEnum),
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
    floorNumber: z.number().min(0).default(0),
    age: z.number().min(0).default(0),
    ageType: z.nativeEnum(AgeTypeEnum).optional(),
    developer: z.string().optional(),
    area: z
      .object({
        plot: z.number().positive().optional(),
        builtIn: z.number().positive().optional()
      })
      .optional(),
    permit: z.object({
      number: z.string().optional(),
      DED: z.string().optional(),
      RERA: z.string().optional(),
      BRN: z.string(),
      tarkheesi: z.string().optional()
    }),
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
    rating: z.number().optional(),
    recommended: z.nativeEnum(RecommendationTypeEnum).optional(),
    project: z
      .string()
      .refine(async (value) => {
        const isObjectId = MongoIdSchema.safeParse(value).success
        if (!isObjectId) return false
        const project = await ProjectModel.findById(value)
        return !!project
      })
      .optional()
  })
  .superRefine(async (values, ctx) => {
    if (values.type === SaleTypeEnum.Rent && !values.price.duration) {
      ctx.addIssue({
        path: ['price', 'duration'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.DURATION_REQUIRED,
        code: 'custom'
      })
    }
    if (values.location.city === 'Dubai' && !values.permit.tarkheesi) {
      ctx.addIssue({
        path: ['permit', 'tarkheesi'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.TRAKHESSI_REQUIRED,
        code: 'custom'
      })
    }
    if (values.location?.city === 'Dubai' && !values?.permit?.number) {
      ctx.addIssue({
        path: ['permit', 'number'], // Specify the field where the error should appear
        message: MESSAGES.required('permit number'),
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
    if (
      values.floors &&
      values.floors > 0 &&
      values.floorNumber &&
      values.floorNumber > 0
    ) {
      if (values.floorNumber > values.floors) {
        ctx.addIssue({
          path: ['floorNumber'], // Specify the field where the error should appear
          message: MESSAGES.invalid('floor number'),
          code: 'custom'
        })
      }
    }
  })

export const PropertyUpdateValidation = z
  .object({
    title: z.string().min(1, MESSAGES.required('title')).optional(),
    description: z.string().min(1, MESSAGES.required('description')).optional(),
    location: LocationUpdateSchema,
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
    floorNumber: z.number().positive().optional(),
    age: z.number().positive().optional(),
    ageType: z.nativeEnum(AgeTypeEnum).optional(),
    furnished: z.nativeEnum(FurnishedEnum).optional(),
    developer: z.string().optional(),
    area: z
      .object({
        plot: z.number().positive().optional(),
        builtIn: z.number().positive().optional()
      })
      .optional(),
    permit: z
      .object({
        number: z.string().optional(),
        DED: z.string().optional(),
        RERA: z.string().optional(),
        BRN: z.string().optional(),
        tarkheesi: z.string().optional()
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
        if (!value) return true
        const category = await CategoryModel.findById(value)
        return !!category
      })
      .optional(),
    subCategory: z
      .string()
      .refine(async (value) => {
        if (!value) return true
        const subCategory = await SubCategoryModel.findById(value)
        return !!subCategory
      })
      .optional(),
    rating: z.number().optional(),
    recommended: z.nativeEnum(RecommendationTypeEnum).optional(),
    project: z
      .string()
      .refine(async (value) => {
        const project = await ProjectModel.findById(value)
        return !!project
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
    if (values.location?.city === 'Dubai' && !values?.permit?.tarkheesi) {
      ctx.addIssue({
        path: ['permit', 'tarkheesi'], // Specify the field where the error should appear
        message: MESSAGES.PROPERTIES.TRAKHESSI_REQUIRED,
        code: 'custom'
      })
    }
    if (values.location?.city === 'Dubai' && !values?.permit?.number) {
      ctx.addIssue({
        path: ['permit', 'number'], // Specify the field where the error should appear
        message: MESSAGES.required('permit number'),
        code: 'custom'
      })
    }
    if (values.subCategory) {
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

export const DeletePropertyValidation = z.object({
  reasonDelete: z.string().min(1, MESSAGES.required('delete reason'))
})

export const PropertyBulkRecommendUpdateSchema = z.object({
  propertyIds: z.array(z.string()).superRefine(async (values, ctx) => {
    const properties = await propertyService.findAll({
      _id: { $in: values },
      recommended: RecommendationTypeEnum.None
    })
    const propertyIdsNotFound: string[] = []
    const propertyIds = properties.results.map((property) =>
      property._id.toString()
    )
    values.forEach((value) => {
      if (!propertyIds.includes(value)) {
        propertyIdsNotFound.push(value)
      }
    })
    if (propertyIdsNotFound.length > 0) {
      ctx.addIssue({
        path: ['propertyIds'],
        message:
          MESSAGES.PROPERTIES.RECOMMENDED_PROPERTIES_NOT_FOUND(
            propertyIdsNotFound
          ),
        code: 'custom'
      })
    }
  }),
  recommended: z.nativeEnum(RecommendationTypeEnum),
  recommendationNoExpireDays: z.number().min(1)
})
