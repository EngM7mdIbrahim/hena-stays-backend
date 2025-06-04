import { ProfileInteractions } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IUserDocument } from './user.interface'

export interface IProfileInteractionsDocument
  extends BaseEntity,
    Omit<ProfileInteractions, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedProfileInteractionsDocument
  extends Omit<IProfileInteractionsDocument, 'user'> {
  user: IUserDocument
}

export type CreateProfileInteractionsDto = Omit<
  ProfileInteractions,
  '_id' | 'createdAt'
>

export type IProfileInteractionsModel = Model<IProfileInteractionsDocument>
