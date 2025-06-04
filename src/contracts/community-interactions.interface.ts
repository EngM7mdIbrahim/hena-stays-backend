import { CommunityInteractions } from '@commonTypes'
import { BaseEntity, IPostDocument } from '@contracts'
import { Model, Types } from 'mongoose'

export interface ICommunityInteractionsDocument
  extends BaseEntity,
    Omit<CommunityInteractions, '_id' | 'post'> {
  post: Types.ObjectId
}

export interface PopulatedCommunityInteractionsDocument
  extends Omit<ICommunityInteractionsDocument, 'post'> {
  post: IPostDocument
}

export type CreateCommunityInteractionsDto = Omit<
  CommunityInteractions,
  '_id' | 'createdAt'
>

export type ICommunityInteractionsModel = Model<ICommunityInteractionsDocument>
