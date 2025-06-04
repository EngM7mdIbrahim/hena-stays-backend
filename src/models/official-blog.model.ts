import { Tables } from '@constants'
import { IOfficialBlogDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { mediaSchema } from './media.schema'

// FAQ schema
const faqSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
})

faqSchema.methods.toJSON = function () {
  const faq = this.toObject()
  delete faq._id
  return faq
}

const seoMetadataSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keywords: {
    type: [String],
    required: true
  }
})

seoMetadataSchema.methods.toJSON = function () {
  const seoMetadata = this.toObject()
  delete seoMetadata._id
  return seoMetadata
}

const officialBlogSchema = new Schema<IOfficialBlogDocument>({
  title: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: Tables.User,
    required: true
  },
  relatedBlogs: {
    type: [Schema.Types.ObjectId],
    ref: Tables.OfficialBlog,
    validate: [
      {
        validator: function (v) {
          return v?.length <= 3
        },
        message: 'Related blogs must be less than 3'
      }
    ],
    default: []
  },
  media: {
    type: new Schema({
      alt: {
        type: String,
        required: true
      }
    }).add(mediaSchema)
  },
  tableOfContents: {
    type: String,
    required: true
  },
  faq: {
    type: [faqSchema],
    default: []
  },
  seo: {
    type: seoMetadataSchema,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  published: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date,
    default: null
  }
}).add(baseSchema)

officialBlogSchema.index({
  title: 'text',
  description: 'text',
  content: 'text'
})

officialBlogSchema.methods.toJSON = function () {
  const officialBlog = baseSchema.methods.toJSON.call(this)
  officialBlog.media = serializeExtended(officialBlog.media)
  officialBlog.relatedBlogs = officialBlog.relatedBlogs.map(
    (_relatedBlogItem: any, index: number) =>
      serializeExtended(this.relatedBlogs[index])
  )
  officialBlog.createdBy = serializeExtended(this.createdBy)
  officialBlog.seo = serializeExtended(this.seo)
  officialBlog.faq = this.faq.map((_faqItem: any, index: number) =>
    serializeExtended(this.faq[index])
  )
  return officialBlog
}

export const OfficialBlogModel = model<IOfficialBlogDocument>(
  Tables.OfficialBlog,
  officialBlogSchema
)
