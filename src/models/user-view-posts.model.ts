import { Tables } from '@constants'
import { IUserViewPostsDocument } from '@contracts'
import mongoose, { Schema, UpdateQuery } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { CommunityInteractionsModel } from './community-interactions.model'

const userViewPostsSchema = new Schema<IUserViewPostsDocument>({
  post: { type: Schema.Types.ObjectId, ref: Tables.Post, required: true },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  views: { type: Number, default: 0 }
}).add(baseSchema)

userViewPostsSchema.methods.toJSON = function () {
  const userViewPosts = baseSchema.methods.toJSON.call(this)
  userViewPosts.post = serializeExtended(this.post)
  userViewPosts.user = serializeExtended(this.user)
  return userViewPosts
}

userViewPostsSchema.pre('save', async function (next) {
  if (this.isNew) {
    await CommunityInteractionsModel.findOneAndUpdate(
      { post: this.post },
      { $inc: { visitors: 1, views: 1 } }
    )
  } else if (this.isModified('views')) {
    await CommunityInteractionsModel.findOneAndUpdate(
      { post: this.post },
      { $inc: { views: 1 } }
    )
  }
  next()
})

async function decVisitorsAndViews(doc: IUserViewPostsDocument) {
  await CommunityInteractionsModel.findOneAndUpdate(
    { post: doc.post },
    { $inc: { visitors: -1, views: -doc.views } }
  )
}

userViewPostsSchema.pre('deleteMany', async function (next) {
  const query = this.getQuery()
  const docs = await this.model.find(query)
  await Promise.all(docs.map(decVisitorsAndViews))
  next()
})

userViewPostsSchema.pre('deleteOne', async function (next) {
  const query = this.getQuery()
  const doc = await this.model.findOne(query)

  if (doc) {
    await decVisitorsAndViews(doc)
  }
  next()
})

userViewPostsSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<IUserViewPostsDocument> | null
  const query = this.getQuery()

  if (update?.$set?.deletedAt) {
    // Get the current document to know how many views to subtract
    const doc = await this.model.findOne(query)
    if (doc) {
      await decVisitorsAndViews(doc)
    }
  }

  if (update?.$inc?.views) {
    await CommunityInteractionsModel.findOneAndUpdate(
      { post: query.post },
      { $inc: { views: 1 } }
    )
  }

  next()
})

export const UserViewPostsModel = mongoose.model<IUserViewPostsDocument>(
  Tables.UserViewPosts,
  userViewPostsSchema
)
