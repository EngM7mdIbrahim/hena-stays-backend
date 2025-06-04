import { UserViewUsers } from '@commonTypes'
import { BaseEntity, IUserDocument } from '@contracts'
import { Model, Types } from 'mongoose'

export interface IUserViewUsersDocument
  extends BaseEntity,
    Omit<UserViewUsers, '_id' | 'userViewed' | 'user'> {
  userViewed: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedUserViewUsersDocument
  extends Omit<IUserViewUsersDocument, 'userViewed' | 'user'> {
  userViewed: IUserDocument
  user: IUserDocument
}

export type CreateUserViewUsersDto = Omit<UserViewUsers, '_id' | 'createdAt'>

export type IUserViewUsersModel = Model<IUserViewUsersDocument>
