import { NotificationTypes } from '@commonTypes'
import { Tables } from '@constants'
import { INotificationDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const notificationSchema = new Schema<INotificationDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true
  },
  body: {
    type: String
  },
  image: {
    type: String
  },
  type: {
    type: String,
    enum: Object.values(NotificationTypes),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  }
}).add(baseSchema)

notificationSchema.methods.toJSON = function () {
  const notification = baseSchema.methods.toJSON.call(this)
  notification.user = serializeExtended(this.user)
  return notification
}

export const NotificationModel = model<INotificationDocument>(
  Tables.Notifications,
  notificationSchema
)
