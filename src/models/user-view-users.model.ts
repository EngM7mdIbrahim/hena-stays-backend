import { Tables } from '@constants'
import { IUserViewUsersDocument } from '@contracts'
import mongoose, { Schema, UpdateQuery } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { ProfileInteractionsModel } from './profile-interactions.model'

const userViewUsersSchema = new Schema<IUserViewUsersDocument>({
  userViewed: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  views: { type: Number, default: 0 }
}).add(baseSchema)

userViewUsersSchema.methods.toJSON = function () {
  const userViewUsers = baseSchema.methods.toJSON.call(this)
  userViewUsers.userViewed = serializeExtended(this.userViewed)
  userViewUsers.user = serializeExtended(this.user)
  return userViewUsers
}

userViewUsersSchema.pre('save', async function (next) {
  if (this.isNew) {
    await ProfileInteractionsModel.findOneAndUpdate(
      { userViewed: this.userViewed },
      { $inc: { visitors: 1, views: 1 } }
    )
  } else if (this.isModified('views')) {
    await ProfileInteractionsModel.findOneAndUpdate(
      { userViewed: this.userViewed },
      { $inc: { views: 1 } }
    )
  }
  next()
})

async function decVisitorsAndViews(doc: IUserViewUsersDocument) {
  return await ProfileInteractionsModel.findOneAndUpdate(
    { userViewed: doc.userViewed },
    { $inc: { visitors: -1, views: -doc.views } }
  )
}

userViewUsersSchema.pre('deleteMany', async function (next) {
  const query = this.getQuery()
  const docs = await this.model.find(query)
  await Promise.all(docs.map(decVisitorsAndViews))
  next()
})

userViewUsersSchema.pre('deleteOne', async function (next) {
  const query = this.getQuery()
  const doc = await this.model.findOne(query)

  if (doc) {
    await decVisitorsAndViews(doc)
  }
  next()
})

userViewUsersSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<IUserViewUsersDocument> | null
  const query = this.getQuery()

  if (update?.$set?.deletedAt) {
    // Get the current document to know how many views to subtract
    const doc = await this.model.findOne(query)
    if (doc) {
      await decVisitorsAndViews(doc)
    }
  }

  if (update?.$inc?.views) {
    await ProfileInteractionsModel.findOneAndUpdate(
      { userViewed: query.userViewed },
      { $inc: { views: 1 } }
    )
  }

  next()
})

export const UserViewUsersModel = mongoose.model<IUserViewUsersDocument>(
  Tables.UserViewUsers,
  userViewUsersSchema
)
