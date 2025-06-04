import { PropertySave } from '@commonTypes'
import { BaseEntity, IPropertyDocument, IUserDocument } from '@contracts'
import { Types } from 'mongoose'

export interface IPropertySaveDocument
  extends BaseEntity,
    Omit<PropertySave, '_id' | 'property' | 'user'> {
  property: Types.ObjectId
  user: Types.ObjectId
}

export interface PopulatedPropertySaveDocument
  extends Omit<IPropertySaveDocument, 'property' | 'user'> {
  property: IPropertyDocument
  user: IUserDocument
}

export type CreatePropertySaveDto = Omit<PropertySave, '_id' | 'createdAt'>
