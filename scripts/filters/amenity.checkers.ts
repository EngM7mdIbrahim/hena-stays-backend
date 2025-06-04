import { AmenitiesCodes } from '@commonTypes'
import { Db } from 'mongodb'
import { OldAmenity } from 'scripts/interfaces-v1'

import { getKeyFromText } from './common/get-key-from-text'
import { amenitiesCodeMapper } from './mappers'

export const checkAllAmenitiesExistInDb = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const amenitiesInMapperNotInDb: string[] = []
  const amenitiesInDbNotInMapper: string[] = []
  let amenitiesEntries = Object.entries(amenitiesCodeMapper)
  logger('Checking if all amenities exist in the database...')
  let amenities = ((await sourceDB
    .collection('amenities')
    .find({})
    .toArray()) ?? []) as OldAmenity[]
  for (const amenity of amenities) {
    const key = getKeyFromText(amenity.name)
    const code = amenitiesCodeMapper[key as keyof typeof amenitiesCodeMapper]
    if (!code) {
      amenitiesInDbNotInMapper.push(amenity.name)
    } else {
      amenitiesEntries = amenitiesEntries.filter(
        ([currentKey, _]) => currentKey !== key
      )
    }
  }
  if (amenitiesEntries.length > 0) {
    throw new Error(
      `Amenities not found in the database: ${amenitiesEntries
        .map(([key, code]) => `${key} (${code})`)
        .join(', ')}`
    )
  }
  if (amenitiesInMapperNotInDb.length > 0) {
    throw new Error(
      `Amenities not found in the database: ${amenitiesInMapperNotInDb.join(
        ', '
      )}`
    )
  }
}
