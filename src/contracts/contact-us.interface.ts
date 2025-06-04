import { ContactUs } from '@commonTypes'

import { BaseEntity } from './db.interface'

export interface IContactUsDocument
  extends BaseEntity,
    Omit<ContactUs, '_id'> {}

export type CreateContactUsDto = Omit<ContactUs, '_id' | 'createdAt'>
