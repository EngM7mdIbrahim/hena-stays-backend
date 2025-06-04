import { Tables } from '@constants'
import { INewsDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { baseSchema } from './base.model'

const newsSchema = new Schema<INewsDocument>({
  title: {
    type: String,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  }
}).add(baseSchema)

newsSchema.methods.toJSON = function () {
  const news = baseSchema.methods.toJSON.call(this)
  return news
}

export const NewsModel = model<INewsDocument>(Tables.News, newsSchema)
