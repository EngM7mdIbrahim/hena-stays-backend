import { Db } from 'mongodb'
import { HydratedDocument, ObjectId, Types } from 'mongoose'

export const checkIfUnique = async <T extends HydratedDocument<ObjectId>>(
  sourceDB: Db,
  collectionName: string,
  singleEntityName: string,
  fieldToCheckOn: keyof T,
  logger: (message: any) => void
) => {
  let result: T[] = []
  const allEntities = ((await sourceDB
    .collection(collectionName)
    .find({})
    .toArray()) ?? []) as T[]
  for (const entity of allEntities) {
    const otherEntities = ((await sourceDB
      .collection(collectionName)
      .find({ [fieldToCheckOn]: entity[fieldToCheckOn] })
      .toArray()) ?? []) as T[]
    if (otherEntities.length > 1) {
      result.push(entity)
      logger(
        `${singleEntityName} with id: ${entity._id} has ${otherEntities.length} other ${singleEntityName} with the same ${fieldToCheckOn as string}`
      )
    }
  }
  return result
}
