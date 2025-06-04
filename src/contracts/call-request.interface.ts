import { CallRequest } from '@commonTypes'
import { Model } from 'mongoose'

import { BaseEntity } from './db.interface'

export interface ICallRequestDocument
  extends BaseEntity,
    Omit<CallRequest, '_id'> {}

export type PopulatedCallRequestDocument = ICallRequestDocument

export type CreateCallRequestDto = Omit<CallRequest, '_id' | 'createdAt'>

export type ICallRequestModel = Model<ICallRequestDocument>
