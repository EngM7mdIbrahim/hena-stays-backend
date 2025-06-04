import { Db } from 'mongodb'
import { OldProperty } from 'scripts/interfaces-v1/property.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'

export const filterSellPropertyRequests = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for deleted sell property requests...')
  const deletedSellPropertyRequests = await getDeletedEntities<OldProperty>(
    sourceDB,
    'sellpropertyrequests'
  )
  logger(
    `Found ${deletedSellPropertyRequests.length} deleted sell property requests in the database:`
  )
  logger(deletedSellPropertyRequests)
  if (deletedSellPropertyRequests.length > 0) {
    logger(
      `Deleting ${deletedSellPropertyRequests.length} sell property requests...`
    )
    for (const sellPropertyRequest of deletedSellPropertyRequests) {
      await deleteEntity(
        sourceDB,
        'sellpropertyrequests',
        'Sell Property Request',
        {
          _id: sellPropertyRequest._id
        },
        logger
      )
    }
  } else {
    logger('No sell property requests to delete, skipping filtering...')
  }
}
