import { Nullable, User, UserStatusType } from '@commonTypes'

import { IBrokerDocument, PopulatedBrokerDocument } from './broker.interface'
import { ICompanyDocument, PopulatedCompanyDocument } from './company.interface'
import { BaseEntity } from './db.interface'
import { ISubscriptionsDocument } from './subscription.interface'

export interface IUserDocument
  extends BaseEntity,
    Omit<User, '_id' | 'broker' | 'company' | 'subscription'> {
  password: string
  broker: Nullable<IBrokerDocument>
  company: Nullable<ICompanyDocument>
  subscription: Nullable<ISubscriptionsDocument>
  otp: Nullable<string>
  otpExpires: Nullable<Date>
  stripeCustomerId?: Nullable<string>
  fcmToken: string
}

export interface PopulatedUserDocument
  extends Omit<IUserDocument, 'company' | 'broker' | 'subscription'> {
  company: Nullable<PopulatedCompanyDocument>
  broker: Nullable<PopulatedBrokerDocument>
  subscription: Nullable<ISubscriptionsDocument>
}

export type CreateUserDto = Omit<
  User,
  | '_id'
  | 'broker'
  | 'company'
  | 'createdAt'
  | 'isActive'
  | 'isBlocked'
  | 'status'
  | 'subscription'
> & {
  password: string
  broker?: string
  company?: string
  status?: UserStatusType
  stripeCustomerId?: string
  subscription?: string
}
