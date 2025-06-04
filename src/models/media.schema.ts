import { MediaTypes } from '@commonTypes'
import { Schema } from 'mongoose'

export const mediaSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(MediaTypes),
    required: true
  },
  url: { type: String, required: true }
})

mediaSchema.methods.toJSON = function () {
  const media = this.toObject()
  delete media._id
  return media
}
