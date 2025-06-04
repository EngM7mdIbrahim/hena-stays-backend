import { UserRole, UserStatus } from '@commonTypes'
import { MESSAGES, Tables } from '@constants'
import { IUserDocument } from '@contracts'
import bcrypt from 'bcrypt'
import { model, Schema, UpdateQuery } from 'mongoose'
import validator from 'validator'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { ProfileInteractionsModel } from './profile-interactions.model'

const userSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, MESSAGES.invalid('email')]
  },
  phone: {
    type: String,
    required: true,
    validate: [validator.isMobilePhone, 'Invalid phone number']
  },
  whatsapp: {
    type: String,
    validate: [validator.isMobilePhone, 'Invalid phone number']
  },
  image: { type: String, default: null },
  watermark: { type: String, default: null },
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.Pending
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.User
  },
  broker: { type: Schema.Types.ObjectId, ref: Tables.Broker },
  company: { type: Schema.Types.ObjectId, ref: Tables.Company },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  stripeCustomerId: { type: String, default: null },
  fcmToken: { type: String, default: null },
  chatMeta: {
    online: { type: Boolean, default: false },
    typing: { type: Boolean, default: false }
  },
  subscription: { type: Schema.Types.ObjectId, ref: Tables.Subscription }
}).add(baseSchema)
userSchema.index({ email: 1, username: 1 })
userSchema.index({
  name: 'text',
  email: 'text',
  username: 'text',
  phone: 'text',
  whatsapp: 'text'
})
userSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = bcrypt.hashSync(this.password, 10)
  }
  next()
})
userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as UpdateQuery<IUserDocument> | null

  if (!update) return next()

  if (update.$set?.password) {
    update.$set.password = bcrypt.hashSync(update.$set.password, 10)
    this.setUpdate(update)
  } else if (update.password) {
    update.password = bcrypt.hashSync(update.password, 10)
    this.setUpdate(update)
  }

  next()
})

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    await ProfileInteractionsModel.create({
      user: this._id,
      views: 0,
      visitors: 0
    })
  }
  next()
})

userSchema.virtual('isActive').get(function () {
  return this.status === UserStatus.Active
})

userSchema.virtual('isBlocked').get(function () {
  return this.status === UserStatus.Blocked
})

userSchema.methods.toJSON = function () {
  const userObject = baseSchema.methods.toJSON.call(this)
  delete userObject.password
  delete userObject.otp
  delete userObject.otpExpires
  delete userObject.stripeCustomerId
  delete userObject.fcmToken
  delete userObject.socketId
  userObject.broker = serializeExtended(this.broker)
  userObject.company = serializeExtended(this.company)
  userObject.subscription = serializeExtended(this.subscription)
  return userObject
}

export const UserModel = model<IUserDocument>(Tables.User, userSchema)
