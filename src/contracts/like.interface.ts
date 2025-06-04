import { Like, Nullable } from '@commonTypes'
import { Types } from 'mongoose'

import { PopulatedCommentDocument } from './comment.interface'
import { BaseEntity } from './db.interface'
import { PopulatedPostDocument } from './post.interface'
import { PopulatedUserDocument } from './user.interface'

export interface ILikeDocument
  extends BaseEntity,
    Omit<Like, '_id' | 'user' | 'post' | 'comment'> {
  user: Types.ObjectId
  post: Types.ObjectId
  comment: Types.ObjectId
}

export interface PopulatedLikeDocument
  extends Omit<ILikeDocument, 'user' | 'post' | 'comment'> {
  user: PopulatedUserDocument
  post: Nullable<PopulatedPostDocument>
  comment: Nullable<PopulatedCommentDocument>
}

export type CreateLikeDto = Omit<Partial<Like>, '_id' | 'createdAt'>
