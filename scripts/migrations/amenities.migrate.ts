import { AmenitiesCodes } from '@commonTypes'
import type { CreateAmenityDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldAmenity } from 'scripts/interfaces-v1'

import { amenitiesCodeMapper } from '../filters/mappers'

const getKeyFromText = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('.', '')
    .replaceAll(',', '')
    .replaceAll('!', '')
    .replaceAll('?', '')
    .replaceAll('&', '')
    .replaceAll('*', '')
    .replaceAll('/', '')
    .replaceAll('\\', '')
    .replaceAll('"', '')
}

export const amenitiesMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  let insertedAmenities: number = 0
  const passedAmenities: OldAmenity[] = []
  const targetAmenityModel = targetDB?.collection('amenities')
  const sourceAmenityModel = sourceDB?.collection('amenities')
  const sourceAmenities =
    (await sourceAmenityModel?.find().sort({ createdAt: 1 }).toArray()) ?? []
  for (let index = 0; index < sourceAmenities.length; index++) {
    const amenity = sourceAmenities[index]
    const amenityWithType: OldAmenity = amenity as unknown as OldAmenity

    const currentAmenityKey = getKeyFromText(amenityWithType.name)
    const currentAmenityCode =
      amenitiesCodeMapper[currentAmenityKey as keyof typeof amenitiesCodeMapper]
    if (!currentAmenityCode) {
      passedAmenities.push(amenityWithType)
      continue
    }
    const newAmenity: CreateAmenityDto & {
      _id: Types.ObjectId
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    } = {
      _id: new Types.ObjectId(amenityWithType._id),
      name: amenityWithType.name,
      image: amenityWithType.image,
      code: currentAmenityCode,
      deletedAt: amenityWithType.deleted ? new Date() : null,
      createdAt: amenityWithType.createdAt,
      updatedAt: amenityWithType.updatedAt
    }
    logger(`Inserting amenity: ${amenityWithType._id}`)
    await targetAmenityModel?.insertOne(newAmenity)
    insertedAmenities++
  }
  logger(`Inserted ${insertedAmenities} amenities`)
  if (passedAmenities.length > 0) {
    logger(
      `Passed amenities: ${passedAmenities.length} as no corresponding code was found in the amenitiesCodeMapper`
    )
    logger(passedAmenities)
  } else {
    logger('No amenities were passed')
  }
}
