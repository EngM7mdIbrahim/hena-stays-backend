import { Config } from '@commonTypes'

import { BaseEntity } from './db.interface'

export interface IConfigDocument extends BaseEntity, Omit<Config, '_id'> {}

export type CreateConfigDto = Omit<Config, '_id' | 'createdAt'>
