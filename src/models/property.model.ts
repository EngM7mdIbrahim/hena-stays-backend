import {
  AgeTypeEnum,
  FurnishedEnum,
  OwnerShipEnum,
  RecommendationTypeEnum
} from '@commonTypes'
import { RECOMMENDATION_SORTING_MAPPER, Tables } from '@constants'
import { IPropertyDocument } from '@contracts'
import moment from 'moment'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { InteractionsModel } from './interactions.model'
import { mediaSchema } from './media.schema'
import { priceSchema } from './price.schema'
import { basePropertySchema } from './property.base.model'

const propertySchema = new Schema<IPropertyDocument>({
  company: {
    type: Schema.Types.ObjectId,
    ref: Tables.Company
  },
  recommended: {
    type: String,
    enum: Object.values(RecommendationTypeEnum),
    default: RecommendationTypeEnum.None
  },
  recommendationExpiresAt: {
    type: Date
  },
  xmlMetaData: {
    lastUpdated: {
      type: Date,
      default: moment().toDate()
    },
    referenceNumber: {
      type: String
    }
  },
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
    required: true,
    minlength: 2,
    trim: true
  },
  furnished: {
    type: String,
    default: FurnishedEnum.Unfurnished,
    enum: Object.values(FurnishedEnum)
  },
  description: {
    type: String,
    minlength: 2,
    trim: true,
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
  },
  permit: {
    number: String,
    DED: String,
    RERA: String,
    BRN: { type: String, required: true, minlength: 2, trim: true },
    tarkheesi: String
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: Tables.Project
  },
  meta: {
    recommendationSortingOrder: {
      type: Number,
      default: 4
    }
  }
}).add(basePropertySchema)
propertySchema.index({ location: '2dsphere' })

propertySchema.index({
  'title': 'text',
  'description': 'text',
  'amenities.other': 'text',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})

propertySchema.pre('save', function (next) {
  this.totalRooms =
    (this.toilets ?? 0) + (this.living ?? 0) + (this.bedroom ?? 0)
  next()
})

propertySchema.pre('save', function (next) {
  if (this.isModified('recommended')) {
    this.meta.recommendationSortingOrder =
      RECOMMENDATION_SORTING_MAPPER[
        this.recommended ?? RecommendationTypeEnum.None
      ]!
  }
  next()
})

// pre save to create interactions entity
propertySchema.pre('save', async function (next) {
  if (this.isNew) {
    await InteractionsModel.create({
      property: this._id
    })
  }
  next()
})

propertySchema.methods.toJSON = function () {
  const property = basePropertySchema.methods.toJSON.call(this)
  delete property.xmlMetaData
  property.media = property.media.map((_media: any, index: number) =>
    serializeExtended(this.media[index])
  )
  property.price = serializeExtended(this.price)
  property.project = serializeExtended(this.project)
  return property
}

export const PropertyModel = model<IPropertyDocument>(
  Tables.Property,
  propertySchema
)
