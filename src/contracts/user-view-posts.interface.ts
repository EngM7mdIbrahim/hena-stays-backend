import { UserViewPosts } from '@commonTypes'
import { BaseEntity, IPostDocument, IUserDocument } from '@contracts'
import { Model, Types } from 'mongoose'

export interface IUserViewPostsDocument
  extends BaseEntity,
    Omit<UserViewPosts, '_id' | 'post' | 'user'> {
  post: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedUserViewPostsDocument
  extends Omit<IUserViewPostsDocument, 'post' | 'user'> {
  post: IPostDocument
  user: IUserDocument
}

export type CreateUserViewPostsDto = Omit<UserViewPosts, '_id' | 'createdAt'>

export type IUserViewPostsModel = Model<IUserViewPostsDocument>
