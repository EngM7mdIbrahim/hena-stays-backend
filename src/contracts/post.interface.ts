import { Post } from '@commonTypes'
import { BaseEntity, PopulatedUserDocument } from '@contracts'
import { Types } from 'mongoose'

export interface IPostDocument extends BaseEntity, Omit<Post, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedPostDocument extends Omit<IPostDocument, 'user'> {
  user: PopulatedUserDocument
}

export type CreatePostDto = Omit<
  Post,
  '_id' | 'createdAt' | 'likes' | 'saves' | 'comments' | 'user'
> & {
  user: string
}
