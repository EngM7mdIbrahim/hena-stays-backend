import { PropertyStatusEnum, RentDurationEnum } from '@commonTypes'
import { CreateRequestBuyPropertyDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { getKeyFromText } from 'scripts/filters/common/get-key-from-text'
import {
  categoryCodeMapper,
  subCategoryCodeMapper
} from 'scripts/filters/mappers'
import { OldRequestBuyProperty } from 'scripts/interfaces-v1/buy-property-request.interface-v1'

import {
  CompletionToOurs,
  furnishedToOurs,
  typeToOurs
} from './commonMappers/property.mappers'

const oldStatus = {
  'Active': 'Active',
  'Not Active': 'Not Active',
  'Processed': 'Processed'
}

const mappingStatus = {
  [oldStatus['Active']]: PropertyStatusEnum.Active,
  [oldStatus['Not Active']]: PropertyStatusEnum.Inactive,
  [oldStatus['Processed']]: PropertyStatusEnum.Inactive
}
export const requestBuyPropertyMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const sourceRequestBuyPropertyModel = sourceDB?.collection('propertyrequests')
  const targetRequestBuyPropertyModel = targetDB?.collection(
    'requestbuyproperties'
  )
  const targetUserModel = targetDB?.collection('users')

  const sourceData = await sourceRequestBuyPropertyModel
    .find()
    .sort({
      createdAt: 1
    })
    .toArray()

  for (let index = 0; index < sourceData.length; index++) {
    const propertyRequest = sourceData[index]
    const propertyRequestWithType =
      propertyRequest as unknown as OldRequestBuyProperty
    logger(`Migrating property request: ${propertyRequestWithType._id}`)

    const propertySourceCategory = await sourceDB
      .collection('categories')
      .findOne({ _id: propertyRequestWithType.category[0] })
    // Checking for the category
    const targetPropertyCategoryCode =
      categoryCodeMapper[
        getKeyFromText(
          propertySourceCategory?.type
        ) as keyof typeof categoryCodeMapper
      ]
    const targetPropertyCategory = await targetDB
      .collection('categories')
      .findOne({
        code: targetPropertyCategoryCode
      })
    if (!targetPropertyCategory) {
      logger(`Category not found, skipping ${propertyRequestWithType._id}`)
      continue
    }

    const targetPropertySubCategoryCode =
      subCategoryCodeMapper[
        getKeyFromText(
          propertySourceCategory?.name
        ) as keyof typeof subCategoryCodeMapper
      ]
    const targetPropertySubCategory = await targetDB
      .collection('subcategories')
      .findOne({
        code: targetPropertySubCategoryCode
      })
    if (!targetPropertySubCategory) {
      logger(`Subcategory not found, skipping ${propertyRequestWithType._id}`)
      continue
    }
    const owner = await targetUserModel?.findOne({
      _id: propertyRequestWithType.owner
    })
    if (!owner) {
      logger(`Owner not found, skipping ${propertyRequestWithType._id}`)
      continue
    }
    const newPropertyRequest: CreateRequestBuyPropertyDto & {
      _id: Types.ObjectId
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    } = {
      _id: new Types.ObjectId(String(propertyRequestWithType._id)),
      createdBy: new Types.ObjectId(String(owner._id)) as any,
      status:
        mappingStatus[propertyRequestWithType.status] ??
        PropertyStatusEnum.Inactive,
      createdAt: new Date(propertyRequestWithType.createdAt),
      updatedAt: new Date(propertyRequestWithType.updatedAt),
      deletedAt: propertyRequestWithType.deleted ? new Date() : null,
      completion: CompletionToOurs[propertyRequestWithType.completion],
      age: {
        from: propertyRequestWithType.age?.min,
        to: propertyRequestWithType.age?.max
      },
      area: {
        from: propertyRequestWithType.area?.min,
        to: propertyRequestWithType.area?.max
      },
      bedroom: {
        from: propertyRequestWithType.bedroom?.min,
        to: propertyRequestWithType.bedroom?.max
      },
      living: {
        from: propertyRequestWithType.living?.min,
        to: propertyRequestWithType.living?.max
      },
      toilets: {
        from: propertyRequestWithType.toilets?.min,
        to: propertyRequestWithType.toilets?.max
      },
      price: {
        from: propertyRequestWithType.price?.min?.value,
        to: propertyRequestWithType.price?.max?.value,
        currency: propertyRequestWithType.price?.min?.currency,
        duration: propertyRequestWithType.price?.min?.duration
          ? RentDurationEnum[propertyRequestWithType.price?.min?.duration]
          : undefined
      },
      type: typeToOurs[propertyRequestWithType.type],
      amenities: {
        basic: propertyRequestWithType.amenities as any,
        other: []
      },
      reasonDelete: propertyRequestWithType.reasonDelete,
      contactWays: propertyRequestWithType.enable,
      furnished: propertyRequestWithType.furnished.map(
        (furnish) => furnishedToOurs[furnish]
      ),
      category: targetPropertyCategory._id as any,
      subCategory: targetPropertySubCategory._id as any,
      location: {
        coordinates: [
          propertyRequestWithType.location.lat,
          propertyRequestWithType.location.lng
        ],
        address: propertyRequestWithType.location.address ?? '',
        name: propertyRequestWithType.location.name ?? '',
        city: propertyRequestWithType.location.city ?? '',
        neighborhoods: propertyRequestWithType.location.neighborhoods ?? '',
        state: propertyRequestWithType.location.state ?? '',
        country: propertyRequestWithType.location.country ?? '',
        street: propertyRequestWithType.location.street ?? ''
      },
      contactInfo: {
        email: owner.email,
        phone: owner.phone,
        whatsapp: owner.whatsapp,
        name: owner.name
      }
    }
    await targetRequestBuyPropertyModel?.insertOne(newPropertyRequest)
  }
}
