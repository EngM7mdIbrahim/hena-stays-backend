import { HydratedDocument, ObjectId, Types } from 'mongoose'

export interface OldUser extends HydratedDocument<ObjectId> {
  _id: Types.ObjectId
  googleId: string
  stripe: string
  username: string
  email: string
  name: string
  phone: string
  whatsapp: string
  language: string
  license: string
  image: string
  watermark: string
  password: string
  links: string
  sent: string
  earnings: string
  member: string
  preferences: ObjectId[]
  viewed: ObjectId[]
  country: ObjectId
  role: string
  refferal: string
  refferalMembership: string
  company: ObjectId
  status: string
  type: string
  companyInfo: ObjectId
  brokerInfo: ObjectId
  online: string
  deleted: boolean
  active: boolean
  resetPasswordToken: string
  resetPasswordExpire: number
  otp: string
  otpExpire: number
  subscription: ObjectId
  stripeCustomerId: string
  createdAt: Date
}
