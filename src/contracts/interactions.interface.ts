import { Interactions, Nullable } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IPropertyDocument } from './property.interface'

export interface IInteractionsDocument
  extends BaseEntity,
    Omit<Interactions, '_id' | 'property'> {
  property: Types.ObjectId
}

export interface PopulatedInteractionsDocument
  extends Omit<IInteractionsDocument, 'property'> {
  property: Nullable<IPropertyDocument>
}

export type CreateInteractionsDto = Omit<Interactions, '_id' | 'createdAt'>

export type IInteractionsModel = Model<IInteractionsDocument>
