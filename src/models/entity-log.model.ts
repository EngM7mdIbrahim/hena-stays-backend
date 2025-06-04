import { EntityActions } from '@commonTypes'
import { Tables } from '@constants'
import { IEntityLogDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const entityLogSchema = new Schema<IEntityLogDocument>({
  entity: {
    type: String,
    required: true,
    trim: true
  },
  entityId: { type: String, required: true },
  action: {
    type: String,
    trim: true,
    required: true,
    enum: Object.values(EntityActions)
  },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  message: { type: String, trim: true, required: true }
}).add(baseSchema)

entityLogSchema.methods.toJSON = function () {
  const log = baseSchema.methods.toJSON.call(this)
  log.user = serializeExtended(this.user)
  return log
}

export const EntityLogModel = model<IEntityLogDocument>(
  Tables.EntityLog,
  entityLogSchema
)
