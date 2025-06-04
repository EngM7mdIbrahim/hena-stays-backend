import { AgeTypeEnum, FurnishedEnum, OwnerShipEnum } from '@commonTypes'
import { Tables } from '@constants'
import { IRequestSellPropertyDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { mediaSchema } from './media.schema'
import { priceSchema } from './price.schema'
import { basePropertySchema } from './property.base.model'

const requestSellPropertySchema = new Schema<IRequestSellPropertyDocument>({
  age: { type: Number, min: 0 },
  ageType: {
    type: String,
    enum: Object.values(AgeTypeEnum)
  },
  developer: String,
  media: {
    type: [mediaSchema],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  furnished: {
    type: String,
    default: FurnishedEnum.Unfurnished,
    enum: Object.values(FurnishedEnum)
  },
  // we should figure out what is "ignored" in the old system
  description: {
    type: String,
    required: true
  },
  ownership: {
    type: String,
    enum: Object.values(OwnerShipEnum)
  },
  rating: { type: Number, default: 0 },

  price: {
    type: priceSchema,
    required: true
  }
}).add(basePropertySchema)

requestSellPropertySchema.index({ location: '2dsphere' })

requestSellPropertySchema.index({
  'title': 'text',
  'description': 'text',
  'amenities.other': 'text',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})

requestSellPropertySchema.methods.toJSON = function () {
  const requestSellProperty = basePropertySchema.methods.toJSON.call(this)
  requestSellProperty.media = requestSellProperty.media.map(
    (_media: any, index: number) => serializeExtended(this.media[index])
  )
  requestSellProperty.price = serializeExtended(this.price)
  return requestSellProperty
}

export const RequestSellPropertyModel = model<IRequestSellPropertyDocument>(
  Tables.RequestSellProperty,
  requestSellPropertySchema
)
