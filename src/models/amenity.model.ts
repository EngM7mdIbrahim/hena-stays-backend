import { Tables } from '@constants'
import { IAmenityDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { baseSchema } from './base.model'

const amenitySchema = new Schema<IAmenityDocument>({
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true }
}).add(baseSchema)

amenitySchema.methods.toJSON = function () {
  const amenity = baseSchema.methods.toJSON.call(this)
  return amenity
}

export const AmenityModel = mongoose.model<IAmenityDocument>(
  Tables.Amenity,
  amenitySchema
)
