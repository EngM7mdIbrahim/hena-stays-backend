import { FurnishedEnum, RentDurationEnum } from '@commonTypes'
import { Tables } from '@constants'
import { IRequestBuyPropertyDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { contactWaysSchema } from './contact-ways.schema'
import { basePropertySchema } from './property.base.model'

const requestBuyPropertySchema = new Schema<IRequestBuyPropertyDocument>({})
  .add(basePropertySchema)
  .add({
    price: {
      from: {
        type: Number,
        min: 0
      },
      to: {
        type: Number,
        min: 0
      },
      duration: {
        type: String,
        enum: Object.values(RentDurationEnum)
      },
      currency: String
    },
    furnished: {
      type: [String],
      default: [FurnishedEnum.Unfurnished],
      enum: Object.values(FurnishedEnum)
    },
    toilets: {
      type: {
        from: {
          type: Number,
          min: 0,
          max: 7
        },
        to: {
          type: Number,
          min: 0,
          max: 7
        }
      }
    },
    living: {
      type: {
        from: {
          type: Number,
          min: 0,
          max: 7
        },
        to: {
          type: Number,
          min: 0,
          max: 7
        }
      }
    },
    bedroom: {
      type: {
        from: {
          type: Number,
          min: 0,
          max: 7
        },
        to: {
          type: Number,
          min: 0,
          max: 7
        }
      }
    },
    area: {
      type: {
        from: {
          type: Number,
          min: 0
        },
        to: {
          type: Number,
          min: 0
        }
      }
    },
    age: {
      type: {
        from: {
          type: Number,
          min: 0
        },
        to: {
          type: Number,
          min: 0
        }
      }
    },
    contactWays: contactWaysSchema,
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      whatsapp: String
    }
  })

requestBuyPropertySchema.index({
  'title': 'text',
  'description': 'text',
  'amenities.other': 'text',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})
requestBuyPropertySchema.methods.toJSON = function () {
  const requestBuyProperty = basePropertySchema.methods.toJSON.call(this)
  delete requestBuyProperty.area?._id
  delete requestBuyProperty.age?._id
  delete requestBuyProperty.bedroom?._id
  delete requestBuyProperty.living?._id
  delete requestBuyProperty.toilets?._id
  requestBuyProperty.contactWays = serializeExtended(this.contactWays)
  return requestBuyProperty
}

export const RequestBuyPropertyModel = model<IRequestBuyPropertyDocument>(
  Tables.RequestBuyProperty,
  requestBuyPropertySchema
)
