import { Tables } from '@constants'
import { IPropertySaveDocument } from '@contracts'
import { baseSchema, InteractionsModel } from '@models'
import mongoose, { Schema, UpdateQuery } from 'mongoose'

import { serializeExtended } from '@utils'

const propertySaveSchema = new Schema<IPropertySaveDocument>({
  property: {
    type: Schema.Types.ObjectId,
    ref: Tables.Property,
    required: true
  },
  user: { type: Schema.Types.ObjectId, ref: Tables.User, required: true }
}).add(baseSchema)

propertySaveSchema.methods.toJSON = function () {
  const save = baseSchema.methods.toJSON.call(this)
  save.property = serializeExtended(this.property)
  save.user = serializeExtended(this.user)
  return save
}

propertySaveSchema.pre('save', async function (next) {
  if (!this.isNew) {
    this.deletedAt = null
  }
  // Here we should do it for the analytics ( for interactions )
  await InteractionsModel.findOneAndUpdate(
    { property: this.property },
    { $inc: { saves: 1 } }
  )
  next()
})
propertySaveSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery()
  const update = this.getUpdate() as UpdateQuery<IPropertySaveDocument> | null

  const doc: IPropertySaveDocument | null = await this.model.findOne(query)
  if (doc && doc.deletedAt && update?.['deletedAt'] === null) {
    await InteractionsModel.findOneAndUpdate(
      { property: doc.property },
      { $inc: { saves: 1 } }
    )
  }
  // Here we should do it for the analytics ( for interactions )
  await InteractionsModel.findOneAndUpdate(
    { property: doc!.property },
    { $inc: { saves: 1 } }
  )
  next()
})

propertySaveSchema.post('findOneAndUpdate', async function (result, next) {
  if (result && result.deletedAt) {
    await InteractionsModel.findOneAndUpdate(
      { property: result.property },
      { $inc: { saves: -1 } }
    )
  }
  next()
})

propertySaveSchema.post('deleteOne', async function (result, next) {
  if (result) {
    await InteractionsModel.findOneAndUpdate(
      { property: result.property },
      { $inc: { saves: -1 } }
    )
  }
  next()
})
export const PropertySaveModel = mongoose.model<IPropertySaveDocument>(
  Tables.PropertySave,
  propertySaveSchema
)
