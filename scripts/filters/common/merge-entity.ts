import { Db, Document, Filter, UpdateFilter } from 'mongodb'

export const mergeEntity = async (
  sourceDB: Db,
  collectionName: string,
  filter: Filter<Document>,
  update: UpdateFilter<Document>,
  logger: (message: any) => void
) => {
  logger(`Merging ${collectionName} ...`)
  const updateResult = await sourceDB
    ?.collection(collectionName)
    .updateMany(filter, { $set: update })
  logger(`Merged ${collectionName} ${updateResult.matchedCount} documents`)
}
