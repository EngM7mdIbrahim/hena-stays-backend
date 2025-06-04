import { Tables } from '@constants'
import { IProjectInteractionsDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const projectInteractionsSchema = new Schema<IProjectInteractionsDocument>({
  project: {
    type: Schema.Types.ObjectId,
    ref: Tables.Project,
    required: true,
    unique: true
  },
  visitors: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 }
}).add(baseSchema)

projectInteractionsSchema.methods.toJSON = function () {
  const interactions = baseSchema.methods.toJSON.call(this)
  interactions.project = serializeExtended(this.project)
  return interactions
}

export const ProjectInteractionsModel = model<IProjectInteractionsDocument>(
  Tables.ProjectInteractions,
  projectInteractionsSchema
)
