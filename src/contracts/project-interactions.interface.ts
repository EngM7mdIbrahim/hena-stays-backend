import { ProjectInteractions } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IProjectDocument } from './project.interface'

export interface IProjectInteractionsDocument
  extends BaseEntity,
    Omit<ProjectInteractions, '_id' | 'project'> {
  project: Types.ObjectId
}

export interface PopulatedProjectInteractionsDocument
  extends Omit<IProjectInteractionsDocument, 'project'> {
  project: IProjectDocument
}

export type CreateProjectInteractionsDto = Omit<
  ProjectInteractions,
  '_id' | 'createdAt'
>

export type IProjectInteractionsModel = Model<IProjectInteractionsDocument>
