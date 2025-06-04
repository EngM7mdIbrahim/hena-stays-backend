import { Schema } from 'mongoose'

export const contactWaysSchema = new Schema(
  {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    truedar: { type: Boolean, default: false }
  },
  { _id: false }
)

contactWaysSchema.methods.toJSON = function () {
  const contactWays = this.toObject()
  delete contactWays._id
  return contactWays
}
