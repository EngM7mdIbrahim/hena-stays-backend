import { Notification, NotificationType } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { PopulatedUserDocument } from './user.interface'

export interface INotificationDocument
  extends BaseEntity,
    Omit<Notification, '_id' | 'user'> {
  user: Types.ObjectId | PopulatedUserDocument
}

export interface PopulatedNotificationDocument
  extends Omit<INotificationDocument, 'user'> {
  user: PopulatedUserDocument
}

export type CreateNotificationDto<
  T extends NotificationType = NotificationType
> = Omit<Notification<T>, '_id' | 'createdAt'>
export type INotificationModel = Model<INotificationDocument>
