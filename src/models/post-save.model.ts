import { Tables } from '@constants'
import { IPostSaveDocument } from '@contracts'
import { baseSchema, CommunityInteractionsModel, PostModel } from '@models'
import mongoose, { Schema, UpdateQuery } from 'mongoose'

import { serializeExtended } from '@utils'

const postSaveSchema = new Schema<IPostSaveDocument>({
  post: { type: Schema.Types.ObjectId, ref: Tables.Post, required: true },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true }
}).add(baseSchema)

postSaveSchema.methods.toJSON = function () {
  const save = baseSchema.methods.toJSON.call(this)
  save.post = serializeExtended(this.post)
  save.user = serializeExtended(this.user)
  return save
}

postSaveSchema.pre('save', async function (next) {
  if (!this.isNew) {
    this.deletedAt = null
  }
  // Here we should do it for the analytics ( for interactions )
  await CommunityInteractionsModel.findOneAndUpdate(
    { post: this.post },
    { $inc: { saves: 1 } }
  )
  await PostModel.findByIdAndUpdate(this.post, { $inc: { saves: 1 } }).exec()
  next()
})

postSaveSchema.post('findOneAndUpdate', async function (result, next) {
  if (result && result.deletedAt) {
    await PostModel.findByIdAndUpdate(result.post, {
      $inc: { saves: -1 }
    }).exec()

    await CommunityInteractionsModel.findOneAndUpdate(
      { post: result.post },
      { $inc: { saves: -1 } }
    )
  }
  next()
})

postSaveSchema.post('deleteOne', async function (result, next) {
  if (result) {
    await PostModel.findByIdAndUpdate(result.post, {
      $inc: { saves: -1 }
    }).exec()

    await CommunityInteractionsModel.findOneAndUpdate(
      { post: result.post },
      { $inc: { saves: -1 } }
    )
  }
  next()
})

postSaveSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery()
  const update = this.getUpdate() as UpdateQuery<IPostSaveDocument> | null

  const doc: IPostSaveDocument | null = await this.model.findOne(query)
  if (doc && doc.deletedAt && update?.['deletedAt'] === null) {
    await CommunityInteractionsModel.findOneAndUpdate(
      { post: doc.post },
      { $inc: { saves: 1 } }
    )
  }
  next()
})
export const PostSaveModel = mongoose.model<IPostSaveDocument>(
  Tables.PostSave,
  postSaveSchema
)
