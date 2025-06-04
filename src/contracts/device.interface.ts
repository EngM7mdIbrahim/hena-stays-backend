import { Device } from '@commonTypes'
import { BaseEntity, IUserDocument } from '@contracts'
import { Model, Types } from 'mongoose'

export interface IDeviceDocument
  extends BaseEntity,
    Omit<Device, '_id' | 'user'> {
  user: Types.ObjectId
}

export interface PopulatedDeviceDocument extends Omit<IDeviceDocument, 'user'> {
  user: IUserDocument
}

export type CreateDeviceDto = Omit<Device, '_id' | 'createdAt'>

export type IDeviceModel = Model<IDeviceDocument>
