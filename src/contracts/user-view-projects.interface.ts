import { UserViewProjects } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IProjectDocument } from './project.interface'
import { IUserDocument } from './user.interface'

export interface IUserViewProjectsDocument
  extends BaseEntity,
    Omit<UserViewProjects, '_id' | 'project' | 'user'> {
  project: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedUserViewProjectsDocument
  extends Omit<IUserViewProjectsDocument, 'project' | 'user'> {
  project: IProjectDocument
  user: IUserDocument
}

export type CreateUserViewProjectsDto = Omit<
  UserViewProjects,
  '_id' | 'createdAt'
>

export type IUserViewProjectsModel = Model<IUserViewProjectsDocument>
