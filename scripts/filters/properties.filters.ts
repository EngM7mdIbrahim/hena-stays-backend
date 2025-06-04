import { UserRole } from '@commonTypes'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldCategory } from 'scripts/interfaces-v1/category.interface-v1'
import { OldProperty } from 'scripts/interfaces-v1/property.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getKeyFromText } from './common/get-key-from-text'
import { getUniqueEntities } from './common/get-unique-entities'
import { categoryCodeMapper, subCategoryCodeMapper } from './mappers'

const deleteAssociatedEntitiesWithProperty = async (
  sourceDB: Db,
  property: OldProperty,
  logger: (message: any) => void
) => {
  logger(`Deleting associated entities for property ${property._id}...`)
  await deleteEntity(
    sourceDB,
    'leads',
    'lead',
    {
      property: property._id
    },
    logger
  )
  await deleteEntity(
    sourceDB,
    'interactions',
    'interaction',
    {
      property: property._id
    },
    logger
  )

  await deleteEntity(
    sourceDB,
    'notifications',
    'notification',
    {
      data: {
        property: property._id
      }
    },
    logger
  )
}
const deleteProperties = async (
  sourceDB: Db,
  properties: OldProperty[],
  logger: (message: any) => void
) => {
  logger(`Deleting ${properties.length} properties...`)
  for (const property of properties) {
    await deleteAssociatedEntitiesWithProperty(sourceDB, property, logger)
    await deleteEntity(
      sourceDB,
      'properties',
      'property',
      { _id: property._id },
      logger
    )
  }
}

const getPropertiesWithInvalidOwner = async (sourceDB: Db, targetDB: Db) => {
  const propertiesMissingOwner: OldProperty[] = []
  const properties = ((await sourceDB
    .collection('properties')
    .find({})
    .toArray()) ?? []) as OldProperty[]
  for (const property of properties) {
    const user = await targetDB
      .collection('users')
      .findOne({ _id: property.owner })
    if (
      ![UserRole.Company, UserRole.Agent, UserRole.Broker].includes(user?.role)
    ) {
      propertiesMissingOwner.push(property)
    }
  }
  return propertiesMissingOwner as OldProperty[]
}

const getPropertiesWithNoCategory = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const propertiesMissingCategory: OldProperty[] = []
  const properties = ((await sourceDB
    .collection('properties')
    .find({})
    .toArray()) ?? []) as OldProperty[]
  for (const property of properties) {
    const category = (await sourceDB
      .collection('categories')
      .findOne({ _id: property.category })) as OldCategory
    if (!category) {
      logger(
        `Property ${property._id} has no category found in the source database`
      )
      propertiesMissingCategory.push(property)
    }
    const categoryCode = getKeyFromText(category.type)
    const subCategoryCode = getKeyFromText(category.name)
    if (!categoryCodeMapper[categoryCode as keyof typeof categoryCodeMapper]) {
      logger(
        `Property ${property._id} has no category code found in the category code mapper`
      )
      propertiesMissingCategory.push(property)
    } else {
      const targetCategory = await targetDB.collection('categories').findOne({
        code: categoryCodeMapper[
          categoryCode as keyof typeof categoryCodeMapper
        ]
      })
      if (!targetCategory) {
        logger(
          `Found the category ${categoryCode} in the category code mapper but no target category found in the target database`
        )
        propertiesMissingCategory.push(property)
      }
    }
    if (
      !subCategoryCodeMapper[
        subCategoryCode as keyof typeof subCategoryCodeMapper
      ]
    ) {
      logger(
        `Property ${property._id} has no sub category code found in the sub category code mapper`
      )
      propertiesMissingCategory.push(property)
    } else {
      const targetSubCategory = await targetDB
        .collection('subcategories')
        .findOne({
          code: subCategoryCodeMapper[
            subCategoryCode as keyof typeof subCategoryCodeMapper
          ]
        })
      if (!targetSubCategory) {
        logger(
          `Found the sub category ${subCategoryCode} in the sub category code mapper but no target sub category found in the target database`
        )
        propertiesMissingCategory.push(property)
      }
    }
  }
  return propertiesMissingCategory
}

const filterOutNonExistingAmenities = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const propertiesWithUpdatedAmenities: OldProperty[] = []
  const properties = ((await sourceDB
    .collection('properties')
    .find({})
    .toArray()) ?? []) as OldProperty[]
  for (const property of properties) {
    logger(`Checking property ${property._id}...`)
    const existingAmenitiesIds: Types.ObjectId[] = []
    for (const amenityId of property.amenities.base) {
      const amenity = await targetDB
        .collection('amenities')
        .findOne({ _id: amenityId })
      if (!amenity) {
        logger(
          `Base amenity: ${amenityId} was not found in the target database for property ${property._id}, skipping...`
        )
        continue
      }
      existingAmenitiesIds.push(amenity._id)
    }
    if (existingAmenitiesIds.length !== property.amenities.base.length) {
      logger(
        `Property ${property._id} has ${
          property.amenities.base.length - existingAmenitiesIds.length
        } base amenities that were not found in the target database, updating the property...`
      )
      const updatedProperty = await sourceDB
        .collection('properties')
        .updateOne(
          { _id: property._id },
          { $set: { amenities: { base: existingAmenitiesIds } } }
        )
      logger(
        `Updated ${updatedProperty.modifiedCount} property with id ${property._id}`
      )
      propertiesWithUpdatedAmenities.push(property)
    }
  }
  return propertiesWithUpdatedAmenities
}

const getSellPropertyRequests = async (sourceDB: Db) => {
  const sellPropertyRequests = ((await sourceDB
    .collection('properties')
    .find({ request: { $exists: true } })
    .toArray()) ?? []) as OldProperty[]
  return sellPropertyRequests
}

const moveSellPropertyRequestsToNewCollection = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const sellPropertyRequests = await getSellPropertyRequests(sourceDB)
  for (const sellPropertyRequest of sellPropertyRequests) {
    await sourceDB
      .collection('sellpropertyrequests')
      .insertOne(sellPropertyRequest)
  }
  await deleteProperties(sourceDB, sellPropertyRequests, logger)
}

export const filterProperties = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for deleted properties...')
  const deletedProperties = await getDeletedEntities<OldProperty>(
    sourceDB,
    'properties'
  )
  logger(
    `Found ${deletedProperties.length} deleted properties in the database:`
  )
  logger(deletedProperties.map((property) => property._id))
  logger('Checking for properties with no owner...')
  const propertiesWithInvalidOwner = await getPropertiesWithInvalidOwner(
    sourceDB,
    targetDB
  )
  logger(
    `Found ${propertiesWithInvalidOwner.length} properties with no owner in the database:`
  )
  logger(propertiesWithInvalidOwner.map((property) => property._id))
  // NOTE: This check is working, but since we don't have such case for the v1 db for now, disabling it for now ...
  // logger('Checking for properties with no category...')
  // const propertiesWithNoCategory = await getPropertiesWithNoCategory(
  //   sourceDB,
  //   targetDB,
  //   logger
  // )
  // logger(
  //   `Found ${propertiesWithNoCategory.length} properties with no category in the database:`
  // )
  // logger(propertiesWithNoCategory.map((property) => property._id))
  logger('Getting unique properties for deletion...')
  const uniqueProperties = getUniqueEntities<OldProperty>([
    ...deletedProperties,
    ...propertiesWithInvalidOwner
    // ...propertiesWithNoCategory
  ])
  logger(`Deleting ${uniqueProperties.length} properties from the database:`)
  logger(uniqueProperties.map((property) => property._id))
  await deleteProperties(sourceDB, uniqueProperties, logger)
  logger('Done!')
  logger('Checking for sell property requests...')
  const sellPropertyRequests = await getSellPropertyRequests(sourceDB)
  logger(sellPropertyRequests.map((property) => property._id))
  logger(
    `Found ${sellPropertyRequests.length} sell property requests in the database:`
  )
  logger('Moving sell property requests to new collection...')
  await moveSellPropertyRequestsToNewCollection(sourceDB, logger)
  logger('Done!')
  logger('Filtering out non existing amenities from the properties...')
  const propertiesWithUpdatedAmenities = await filterOutNonExistingAmenities(
    sourceDB,
    targetDB,
    logger
  )
  logger(
    `Found ${propertiesWithUpdatedAmenities.length} properties with updated amenities in the database:`
  )
  logger(propertiesWithUpdatedAmenities.map((property) => property._id))
  logger('Checking for properties with invalid owners ...')
  const propertiesWithInvalidOwners = await getPropertiesWithInvalidOwner(
    sourceDB,
    targetDB
  )
  logger(
    `Found ${propertiesWithInvalidOwners.length} properties with invalid owners in the database:`
  )
  logger(propertiesWithInvalidOwners.map((property) => property._id))
}
