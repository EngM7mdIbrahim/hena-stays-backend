import { Db } from 'mongodb'

export const getDeletedEntities = async <T>(
  sourceDB: Db,
  collectionName: string
) => {
  return ((await sourceDB
    .collection(collectionName)
    .find({ deleted: true })
    .toArray()) ?? []) as T[]
}
