import { Tables } from '@constants'
import { IUserViewProjectsDocument } from '@contracts'
import { model, Schema } from 'mongoose'

const UserViewProjectsSchema = new Schema<IUserViewProjectsDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: Tables.User,
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: Tables.Project,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

export const UserViewProjectsModel = model<IUserViewProjectsDocument>(
  Tables.UserViewProjects,
  UserViewProjectsSchema
)
