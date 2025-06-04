import { UserRole } from '@commonTypes'
import { Db } from 'mongodb'
import { OldRequestBuyProperty } from 'scripts/interfaces-v1/buy-property-request.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getBuyPropertiesRequestsWithInvalidOwner = async (
  sourceDB: Db,
  targetDB: Db
) => {
  const propertiesMissingOwner: OldRequestBuyProperty[] = []
  const properties = ((await sourceDB
    .collection('propertyrequests')
    .find({})
    .toArray()) ?? []) as OldRequestBuyProperty[]
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
  return propertiesMissingOwner as OldRequestBuyProperty[]
}

export const filterBuyPropertyRequests = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for buy property requests with no owner...')
  const requestsMissingOwner = await getBuyPropertiesRequestsWithInvalidOwner(
    sourceDB,
    targetDB
  )
  logger(
    `Found ${requestsMissingOwner.length} deleted buy property requests in the database:`
  )
  logger(requestsMissingOwner)

  logger('Checking for deleted buy property requests...')

  const deletedBuyPropertyRequests =
    await getDeletedEntities<OldRequestBuyProperty>(
      sourceDB,
      'buypropertyrequests'
    )
  logger(
    `Found ${deletedBuyPropertyRequests.length} deleted buy property requests in the database:`
  )
  logger(deletedBuyPropertyRequests)
  const uniqueBuyPropertyRequests = getUniqueEntities<OldRequestBuyProperty>([
    ...deletedBuyPropertyRequests,
    ...requestsMissingOwner
  ])
  if (uniqueBuyPropertyRequests.length > 0) {
    logger(
      `Deleting ${uniqueBuyPropertyRequests.length} buy property requests...`
    )
    for (const buyPropertyRequest of uniqueBuyPropertyRequests) {
      await deleteEntity(
        sourceDB,
        'buypropertyrequests',
        'Buy Property Request',
        {
          _id: buyPropertyRequest._id
        },
        logger
      )
    }
  } else {
    logger('No buy property requests to delete, skipping filtering...')
  }
}
