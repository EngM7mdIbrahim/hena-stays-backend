import { OSEnum, Platforms } from '@commonTypes'
import { Tables } from '@constants'
import { IDeviceDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { baseSchema } from './base.model'

const deviceSchema = new Schema<IDeviceDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true
  },
  fcmToken: {
    type: String,
    required: true
  },
  device: {
    platform: {
      type: String,
      enum: Object.values(Platforms),
      required: true
    },
    os: {
      type: String,
      required: true,
      enum: Object.values(OSEnum)
    }
  }
}).add(baseSchema)

export const DeviceModel = mongoose.model<IDeviceDocument>(
  Tables.Device,
  deviceSchema
)
