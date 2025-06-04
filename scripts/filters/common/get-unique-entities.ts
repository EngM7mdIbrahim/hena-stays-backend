import { Db, Filter } from 'mongodb'
import { Document, HydratedDocument, ObjectId } from 'mongoose'

export const getUniqueEntities = <
  T extends
    | HydratedDocument<ObjectId>
    | (Omit<HydratedDocument<ObjectId>, 'text'> & { text: string })
>(
  entities: T[]
) => {
  const uniqueIds = Array.from(
    new Set(entities.map((entity) => entity._id.toString()))
  )
  const uniqueEntities = uniqueIds.map(
    (id) => entities.find((entity) => entity._id.toString() === id)!
  )
  return uniqueEntities
}
