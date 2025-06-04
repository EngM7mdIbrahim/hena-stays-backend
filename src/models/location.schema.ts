import { LocationTypes } from '@commonTypes'
import { Schema } from 'mongoose'

export const locationSchema = new Schema({
  address: { type: String, required: true, trim: true },
  name: { type: String, required: true, default: '' },
  street: { type: String, required: true, default: '' },
  neighborhoods: { type: String, required: true, default: '' },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    type: [Number],
    required: true,
    validate: (value: number[]) => value.length === 2
  },
  type: {
    type: String,
    default: LocationTypes.Point,
    enum: Object.values(LocationTypes)
  }
})

locationSchema.methods.toJSON = function () {
  const location = this.toObject()
  delete location._id
  return location
}
