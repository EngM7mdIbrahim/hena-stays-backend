import { Tables } from '@constants'
import { IPostDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { CommunityInteractionsModel } from './community-interactions.model'
import { locationSchema } from './location.schema'
import { mediaSchema } from './media.schema'

const postSchema = new Schema<IPostDocument>({
  description: { type: String, required: true, trim: true, minlength: 3 },
  location: { type: locationSchema, required: true },
  media: {
    type: [mediaSchema],
    required: true,
    default: []
  },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  comments: { type: Number, default: 0 }
}).add(baseSchema)

postSchema.index({ location: '2dsphere' })

postSchema.methods.toJSON = function () {
  const post = baseSchema.methods.toJSON.call(this)
  post.media = post.media.map((_mediaItem: any, index: number) =>
    serializeExtended(this.media[index])
  )
  post.user = serializeExtended(this.user)
  if (post.location) {
    post.location = serializeExtended(this.location)
  }
  return post
}

postSchema.index({
  'description': 'text',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})

postSchema.pre('save', async function (next) {
  if (this.isNew) {
    await CommunityInteractionsModel.create({ post: this._id })
  }
  next()
})

export const PostModel = mongoose.model<IPostDocument>(Tables.Post, postSchema)
