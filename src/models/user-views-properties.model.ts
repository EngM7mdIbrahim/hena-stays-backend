import { Tables } from '@constants'
import { IUserViewPropertiesDocument } from '@contracts'
import { model, Schema, UpdateQuery } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { InteractionsModel } from './interactions.model'

const userViewsPropertiesSchema = new Schema<IUserViewPropertiesDocument>({
  property: {
    type: Schema.Types.ObjectId,
    ref: Tables.Property,
    required: true
  },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  views: { type: Number, default: 0 }
}).add(baseSchema)

userViewsPropertiesSchema.index({ user: 1, property: 1 }, { unique: true })
// pre save to increase impressions and clicks ( if new )
userViewsPropertiesSchema.pre('save', async function (next) {
  if (this.isNew) {
    await InteractionsModel.findOneAndUpdate(
      { property: this.property },
      { $inc: { visitors: 1, views: 1 } }
    )
  } else if (this.isModified('views')) {
    await InteractionsModel.findOneAndUpdate(
      { property: this.property },
      { $inc: { views: 1 } }
    )
  }
  next()
})

async function decVisitorsAndViews(doc: IUserViewPropertiesDocument) {
  await InteractionsModel.findOneAndUpdate(
    { property: doc.property },
    { $inc: { visitors: -1, views: -doc.views } }
  )
}

userViewsPropertiesSchema.pre('deleteMany', async function (next) {
  const query = this.getQuery()
  const docs = await this.model.find(query)
  await Promise.all(docs.map(decVisitorsAndViews))
  next()
})

userViewsPropertiesSchema.pre('deleteOne', async function (next) {
  const query = this.getQuery()
  const doc = await this.model.findOne(query)
  if (doc) {
    await decVisitorsAndViews(doc)
  }
  next()
})

userViewsPropertiesSchema.pre('findOneAndUpdate', async function (next) {
  const update =
    this.getUpdate() as UpdateQuery<IUserViewPropertiesDocument> | null
  const query = this.getQuery()

  if (update?.$set?.deletedAt) {
    // Get the current document to know how many views to subtract
    const doc = await this.model.findOne(query)
    if (doc) {
      await decVisitorsAndViews(doc)
    }
  }

  if (update?.$inc?.views) {
    await InteractionsModel.findOneAndUpdate(
      { property: query.property },
      { $inc: { views: 1 } }
    )
  }

  next()
})

userViewsPropertiesSchema.methods.toJSON = function () {
  const userViewProperties = baseSchema.methods.toJSON.call(this)
  userViewProperties.property = serializeExtended(this.property)
  userViewProperties.user = serializeExtended(this.user)
  return userViewProperties
}

export const UserViewPropertiesModel = model<IUserViewPropertiesDocument>(
  Tables.UserViewProperties,
  userViewsPropertiesSchema
)
