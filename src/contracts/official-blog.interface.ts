import { Nullable, OfficialBlog, User } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'

export interface IOfficialBlogDocument
  extends BaseEntity,
    Omit<OfficialBlog, '_id' | 'createdBy' | 'relatedBlogs'> {
  createdBy: Types.ObjectId
  relatedBlogs: Types.ObjectId[]
}

export interface PopulatedOfficialBlogDocument
  extends Omit<IOfficialBlogDocument, 'createdBy' | 'relatedBlogs'> {
  createdBy: Nullable<User>
  relatedBlogs: Nullable<OfficialBlog[]>
}

export type CreateOfficialBlogDto = Omit<OfficialBlog, '_id' | 'createdAt'>

export type IOfficialBlogModel = Model<IOfficialBlogDocument>
