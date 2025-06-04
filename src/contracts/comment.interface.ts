import { Comment } from '@commonTypes'
import {
  BaseEntity,
  PopulatedPostDocument,
  PopulatedUserDocument
} from '@contracts'
import { Types } from 'mongoose'

export interface ICommentDocument
  extends BaseEntity,
    Omit<Comment, '_id' | 'post' | 'user'> {
  user: Types.ObjectId
  post: Types.ObjectId
}

export interface PopulatedCommentDocument
  extends Omit<ICommentDocument, 'user' | 'post'> {
  user: PopulatedUserDocument
  post: PopulatedPostDocument
}

export type CreateCommentDto = Omit<Comment, '_id' | 'createdAt' | 'likes'>
