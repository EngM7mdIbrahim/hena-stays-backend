import { Follow } from '@commonTypes'
import { BaseEntity, PopulatedUserDocument } from '@contracts'
import { Types } from 'mongoose'

export interface IFollowDocument
  extends BaseEntity,
    Omit<Follow, '_id' | 'follower' | 'following'> {
  follower: Types.ObjectId
  following: Types.ObjectId
}

export interface PopulatedFollowDocument
  extends Omit<IFollowDocument, 'follower' | 'following'> {
  follower: PopulatedUserDocument
  following: PopulatedUserDocument
}

export type CreateFollowDto = Omit<Follow, '_id' | 'createdAt'>
