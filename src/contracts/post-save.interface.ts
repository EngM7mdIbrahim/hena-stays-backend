import { PostSave } from '@commonTypes'
import { BaseEntity, IPostDocument, IUserDocument } from '@contracts'
import { Types } from 'mongoose'

export interface IPostSaveDocument
  extends BaseEntity,
    Omit<PostSave, '_id' | 'post' | 'user'> {
  post: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedPostSaveDocument
  extends Omit<IPostSaveDocument, 'post' | 'user'> {
  post: IPostDocument
  user: IUserDocument
}

export type CreatePostSaveDto = Omit<PostSave, '_id' | 'createdAt'>
