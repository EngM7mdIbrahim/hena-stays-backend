import { Blog } from '@commonTypes'
import { Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface IBlogDocument extends BaseEntity, Omit<Blog, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedBlogDocument extends Omit<IBlogDocument, 'user'> {
  user: PopulatedUserDocument
}

export type CreateBlogDto = Omit<Blog, '_id' | 'createdAt'>
