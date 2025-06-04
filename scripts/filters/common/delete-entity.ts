import { Db, Document, Filter } from 'mongodb'

export const deleteEntity = async (
  sourceDB: Db,
  collectionName: string,
  singleEntityName: string,
  filter: Filter<Document>,
  logger: (message: any) => void
) => {
  logger(`Deleting ${singleEntityName} ...`)
  const entities =
    (await sourceDB?.collection(collectionName).find(filter).toArray()) ?? []
  logger(`Found ${entities.length} ${singleEntityName}`)
  for (const entity of entities) {
    await sourceDB?.collection(collectionName).deleteOne({ _id: entity._id })
    logger(`Deleted ${singleEntityName}:`)
    logger(entity)
  }
}
