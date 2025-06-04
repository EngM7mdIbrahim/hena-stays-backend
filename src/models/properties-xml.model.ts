import { Tables } from '@constants'
import { IPropertiesXMLDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const propertiesXMLSchema = new Schema<IPropertiesXMLDocument>({
  creator: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true
  },
  lastUpdatedAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rejectionReason: {
    type: String,
    default: null
  },
  xmlErrors: {
    type: [String],
    default: []
  },
  warnings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  originalParsedProperties: {
    type: Schema.Types.Mixed,
    default: []
  },
  tempProperties: {
    type: Schema.Types.Mixed,
    default: []
  }
}).add(baseSchema)

propertiesXMLSchema.index({ creator: 1, lastUpdatedAt: -1 })
propertiesXMLSchema.index({ status: 1 })

propertiesXMLSchema.methods.toJSON = function () {
  const propertiesXML = baseSchema.methods.toJSON.call(this)
  propertiesXML.creator = serializeExtended(this.creator)
  return propertiesXML
}

export const PropertiesXMLModel = mongoose.model<IPropertiesXMLDocument>(
  Tables.PropertiesXML,
  propertiesXMLSchema
)
