import { AgeTypeEnumType, RentDurationEnum } from '@commonTypes'
import { CreateInteractionsDto, CreatePropertyDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { getKeyFromText } from 'scripts/filters/common/get-key-from-text'
import {
  categoryCodeMapper,
  subCategoryCodeMapper
} from 'scripts/filters/mappers'
import { OldProperty } from 'scripts/interfaces-v1/property.interface-v1'

import { getLocationIfNotExists } from './commonMappers/location.default'
import {
  CompletionToOurs,
  furnishedToOurs,
  ownershipToOurs,
  statusToOurs,
  typeToOurs
} from './commonMappers/property.mappers'

export const propertyMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: string) => void
) => {
  const sourcePropertyModel = sourceDB?.collection('properties')
  const targetPropertyModel = targetDB?.collection('properties')
  const targetInteractionsModel = targetDB?.collection('interactions')

  const sourceProperties = ((await sourcePropertyModel
    ?.find()
    .sort({ createdAt: 1 })
    .toArray()) ?? []) as OldProperty[]
  for (const property of sourceProperties) {
    const propertySourceCategory = await sourceDB
      .collection('categories')
      .findOne({ _id: property.category })
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
      logger(`Category not found, skipping ${property._id}`)
      continue
    }
    // Checking for the sub category
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
      logger(`Subcategory not found, skipping ${property._id}`)
      continue
    }
    // Checking for the owner
    const targetPropertyOwner = await targetDB.collection('users').findOne({
      _id: property.owner
    })
    if (!targetPropertyOwner) {
      logger(`Owner not found, skipping ${property._id}`)
      continue
    }
    // Checking for the amenities
    let shouldSkip = false
    for (const amenityId of property.amenities.base) {
      const targetPropertyAmenity = await targetDB
        .collection('amenities')
        .findOne({
          _id: amenityId
        })
      if (!targetPropertyAmenity) {
        logger(`Amenity not found, skipping ${property._id}`)
        shouldSkip = true
        break
      }
    }
    if (shouldSkip) {
      continue
    }

    const newProperty: Omit<
      CreatePropertyDto,
      'createdBy' | 'category' | 'subCategory'
    > & {
      _id: Types.ObjectId
      createdBy: Types.ObjectId
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      category: Types.ObjectId
      subCategory: Types.ObjectId
      company: Types.ObjectId
    } = {
      _id: new Types.ObjectId(property._id),
      title: property.name,
      completion: CompletionToOurs[property.completion],
      createdBy: new Types.ObjectId(targetPropertyOwner._id),
      status: statusToOurs[property.status],
      type: typeToOurs[property.type],
      description: property.description,
      location: getLocationIfNotExists(property.location),
      media: property.media,
      price: {
        value: property.price?.value,
        currency: property.price?.currency,
        duration: property.price?.duration
          ? RentDurationEnum[property.price?.duration]
          : null
      },
      toilets: property.rooms?.toilets ?? 0,
      living: property.rooms?.living ?? 0,
      bedroom: property.rooms?.bedroom ?? 0,
      totalRooms:
        (property.rooms?.toilets ?? 0) +
        (property.rooms?.living ?? 0) +
        (property.rooms?.bedroom ?? 0),
      permit: property.permit,
      age: property.age ?? 0,
      ageType: property.ageType as AgeTypeEnumType,
      developer: property.developer ?? '',
      amenities: {
        basic: (property.amenities?.base as any) ?? [],
        other: (property.amenities?.other as any) ?? []
      },
      area: {
        plot: property.area?.plot ?? 0,
        builtIn: property.area?.builtIn ?? 0
      },
      floors: Number(property.floors?.total) ?? null,
      floorNumber: Number(property.floors?.number) ?? null,
      category: targetPropertyCategory._id,
      subCategory: targetPropertySubCategory._id,
      company: targetPropertyOwner.company
        ? targetPropertyOwner.company
        : (null as any),
      furnished: furnishedToOurs[property.furnished],
      ownership: property.ownership
        ? ownershipToOurs[property.ownership]
        : undefined,
      recommended: property.recommended,
      recommendationExpiresAt: property.recommendationExpiresAt,
      reasonDelete: property.reasonDelete,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      deletedAt: property.deleted ? new Date() : null
    }
    logger(`Inserting property: ${property._id}`)
    await targetPropertyModel?.insertOne(newProperty)

    const newInteraction: Omit<CreateInteractionsDto, 'property'> & {
      property: Types.ObjectId
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    } = {
      property: new Types.ObjectId(newProperty._id),
      createdAt: new Date(),
      deletedAt: null,
      impressions: 0,
      views: 0,
      leadClicks: {
        chat: 0,
        email: 0,
        phone: 0,
        whatsapp: 0
      },
      saves: 0,
      updatedAt: new Date(),
      visitors: 0
    }
    await targetInteractionsModel.insertOne(newInteraction)
    logger(`Migrated property: ${newProperty._id}`)
  }
}
