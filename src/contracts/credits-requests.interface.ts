import { CreditsRequest } from '@commonTypes'
import { Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IUserDocument } from './user.interface'

export interface ICreditsRequestDocument
  extends BaseEntity,
    Omit<CreditsRequest, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedCreditsRequestDocument
  extends Omit<ICreditsRequestDocument, 'user'> {
  user: IUserDocument
}

export type CreateCreditsRequestDto = Omit<
  CreditsRequest,
  '_id' | 'createdAt' | 'taxes' | 'total'
>
