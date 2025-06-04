import { Tables } from '@constants'
import { IFollowDocument } from '@contracts'
import { baseSchema } from '@models'
import mongoose, { Schema } from 'mongoose'

import { serializeExtended } from '@utils'

const followSchema = new Schema<IFollowDocument>({
  follower: { type: Schema.Types.ObjectId, ref: Tables.User, required: true },
  following: { type: Schema.Types.ObjectId, ref: Tables.User, required: true }
}).add(baseSchema)

followSchema.methods.toJSON = function () {
  const follow = baseSchema.methods.toJSON.call(this)
  follow.follower = serializeExtended(this.follower)
  follow.following = serializeExtended(this.following)
  return follow
}

export const FollowModel = mongoose.model<IFollowDocument>(
  Tables.Follow,
  followSchema
)
