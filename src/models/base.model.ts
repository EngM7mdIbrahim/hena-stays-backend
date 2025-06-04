import { Schema } from 'mongoose'

export const baseSchema = new Schema(
  {
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

baseSchema.methods.toJSON = function () {
  const entity = this.toObject()
  entity._id = entity._id.toString()
  delete entity.deletedAt
  delete entity.updatedAt
  delete entity.__v
  delete entity.id
  return entity
}
