import { IConfigDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { baseSchema } from './base.model'

const ConfigSchema = new Schema<IConfigDocument>({
  propertyRecommendations: {
    hot: [
      {
        price: {
          type: Number,
          default: 0
        },
        noExpireDays: {
          type: Number,
          default: 0
        }
      }
    ],
    propertyOfWeek: [
      {
        price: {
          type: Number,
          default: 0
        },
        noExpireDays: {
          type: Number,
          default: 0
        }
      }
    ],
    signature: [
      {
        price: {
          type: Number,
          default: 0
        },
        noExpireDays: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  creditsPrice: {
    type: Number,
    default: 0
  }
}).add(baseSchema)

ConfigSchema.methods.toJSON = function () {
  const config: IConfigDocument = baseSchema.methods.toJSON.call(this)
  config.propertyRecommendations.hot = config.propertyRecommendations.hot.map(
    (recommendation: any) => {
      delete recommendation._id
      return recommendation
    }
  )
  config.propertyRecommendations.propertyOfWeek =
    config.propertyRecommendations.propertyOfWeek.map((recommendation: any) => {
      delete recommendation._id
      return recommendation
    })
  config.propertyRecommendations.signature =
    config.propertyRecommendations.signature.map((recommendation: any) => {
      delete recommendation._id
      return recommendation
    })
  return config
}

export const ConfigModel = model<IConfigDocument>('Config', ConfigSchema)
