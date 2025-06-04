import { Tables } from '@constants'
import { ILikeDocument } from '@contracts'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { CommentModel } from './comment.model'
import { PostModel } from './post.model'

const likeSchema = new Schema<ILikeDocument>({
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  post: { type: Schema.Types.ObjectId, ref: Tables.Post },
  comment: { type: Schema.Types.ObjectId, ref: Tables.Comment }
}).add(baseSchema)

likeSchema.methods.toJSON = function () {
  const like = baseSchema.methods.toJSON.call(this)
  like.user = serializeExtended(this.user)
  if (like.post) {
    like.post = serializeExtended(this.post)
  }
  if (like.comment) {
    like.comment = serializeExtended(this.comment)
  }
  return like
}
likeSchema.post('save', async function (doc) {
  if (doc.post) {
    await PostModel.findByIdAndUpdate(doc.post, { $inc: { likes: 1 } })
  }
  if (doc.comment) {
    await CommentModel.findByIdAndUpdate(doc.comment, { $inc: { likes: 1 } })
  }
})
likeSchema.post('findOneAndUpdate', async function (result, next) {
  if (result && result.deletedAt) {
    if (result.post) {
      await PostModel.findByIdAndUpdate(result.post, { $inc: { likes: -1 } })
    }
    if (result.comment) {
      await CommentModel.findByIdAndUpdate(result.comment, {
        $inc: { likes: -1 }
      })
    }
    next()
  }
})

likeSchema.post('deleteOne', async function (result, next) {
  if (result) {
    if (result.post) {
      await PostModel.findByIdAndUpdate(result.post, { $inc: { likes: -1 } })
    }
    if (result.comment) {
      await CommentModel.findByIdAndUpdate(result.comment, {
        $inc: { likes: -1 }
      })
    }
  }
  next()
})

export const LikeModel = mongoose.model<ILikeDocument>(Tables.Like, likeSchema)
