import { Amenity } from '@commonTypes'

import { BaseEntity } from './db.interface'

export interface IAmenityDocument extends BaseEntity, Omit<Amenity, '_id'> {}

export type PopulatedAmenityDocument = IAmenityDocument

export type CreateAmenityDto = Omit<Amenity, '_id' | 'createdAt'>
