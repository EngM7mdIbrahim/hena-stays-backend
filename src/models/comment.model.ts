import { Tables } from '@constants'
import { ICommentDocument } from '@contracts'
import { baseSchema, PostModel } from '@models'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

const commentSchema = new Schema<ICommentDocument>({
  description: { type: String, required: true, trim: true },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  post: { type: Schema.Types.ObjectId, ref: Tables.Post, required: true },
  likes: { type: Number, default: 0 }
}).add(baseSchema)

commentSchema.methods.toJSON = function () {
  const comment = baseSchema.methods.toJSON.call(this)
  comment.user = serializeExtended(this.user)
  comment.post = serializeExtended(this.post)
  return comment
}

commentSchema.pre('save', async function (next) {
  await PostModel.updateOne({ _id: this.post }, { $inc: { comments: 1 } })
  next()
})

commentSchema.post('findOneAndUpdate', async function (result, next) {
  if (result && result.deletedAt) {
    await PostModel.updateOne({ _id: result.post }, { $inc: { comments: -1 } })
  }
  next()
})

commentSchema.post('deleteOne', async function (result, next) {
  if (result) {
    await PostModel.updateOne({ _id: result.post }, { $inc: { comments: -1 } })
  }
  next()
})

export const CommentModel = mongoose.model<ICommentDocument>(
  Tables.Comment,
  commentSchema
)
