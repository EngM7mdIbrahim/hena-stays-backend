import { CompletionEnum, PropertyStatusEnum, SaleTypeEnum } from '@commonTypes'
import { Tables } from '@constants'
import { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { locationSchema } from './location.schema'

export const basePropertySchema = new Schema({
  status: {
    type: String,
    enum: Object.values(PropertyStatusEnum),
    default: PropertyStatusEnum.Active
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(SaleTypeEnum)
  },
  completion: {
    type: String,
    required: true,
    enum: Object.values(CompletionEnum)
  },
  location: {
    type: locationSchema,
    required: true
  },
  amenities: {
    basic: {
      type: [Schema.Types.ObjectId],
      ref: Tables.Amenity,
      default: []
    },
    other: {
      type: [String],
      default: []
    }
  },
  toilets: { type: Number, min: 0, default: 0 },
  living: { type: Number, min: 0, default: 0 },
  bedroom: { type: Number, min: 0, default: 0 },
  totalRooms: { type: Number, min: 0, default: 0 },
  floors: { type: Number, min: 0 },
  floorNumber: { type: Number, min: 0 },
  area: {
    plot: { type: Number, min: 0 },
    builtIn: { type: Number, min: 0 }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: Tables.Category
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: Tables.SubCategory
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: Tables.User
  },
  reasonDelete: {
    type: String,
    trim: true
  }
}).add(baseSchema)

basePropertySchema.methods.toJSON = function () {
  const baseProperty = baseSchema.methods.toJSON.call(this)
  baseProperty.location = serializeExtended(this.location)
  baseProperty.amenities = {
    basic: this.amenities.basic.map((_amenity: any, index: number) =>
      serializeExtended(this.amenities.basic[index])
    ),
    other: this.amenities.other
  }
  baseProperty.category = serializeExtended(this.category)
  baseProperty.subCategory = serializeExtended(this.subCategory)
  baseProperty.createdBy = serializeExtended(this.createdBy)
  return baseProperty
}
