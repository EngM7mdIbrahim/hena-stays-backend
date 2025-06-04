import { EntityLog } from '@commonTypes'
import { Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface IEntityLogDocument
  extends BaseEntity,
    Omit<EntityLog, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedEntityLogDocument
  extends Omit<IEntityLogDocument, 'user'> {
  user: PopulatedUserDocument
}

export type CreateEntityLogDto = Omit<EntityLog, '_id' | 'createdAt'>
