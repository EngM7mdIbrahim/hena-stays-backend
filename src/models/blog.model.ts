import { Tables } from '@constants'
import { IBlogDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { mediaSchema } from './media.schema'

const blogSchema = new Schema<IBlogDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  media: { type: [mediaSchema], required: true },
  tableOfContents: { type: String, required: true, trim: true },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true }
}).add(baseSchema)

blogSchema.methods.toJSON = function () {
  const blog = baseSchema.methods.toJSON.call(this)
  if (blog.media) {
    blog.media = blog.media.map((mediaItem: any) => {
      delete mediaItem._id
      return mediaItem
    })
  }
  blog.user = serializeExtended(this.user)
  return blog
}

blogSchema.index({
  title: 'text',
  description: 'text',
  content: 'text'
})

export const BlogModel = mongoose.model<IBlogDocument>(Tables.Blog, blogSchema)
