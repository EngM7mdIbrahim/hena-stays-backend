import { News } from '@commonTypes'
import { Model } from 'mongoose'

import { BaseEntity } from './db.interface'

export interface INewsDocument extends BaseEntity, Omit<News, '_id'> {}

export type CreateNewsDto = Omit<News, '_id' | 'createdAt'>

export type INewsModel = Model<INewsDocument>
