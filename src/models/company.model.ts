import { Authority, Jurisdiction } from '@commonTypes'
import { Tables } from '@constants'
import { ICompanyDocument } from '@contracts'
import { model, Schema } from 'mongoose'
import validator from 'validator'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'

const companySchema = new Schema<ICompanyDocument>({
  owner: { type: Schema.Types.ObjectId, ref: Tables.User },
  name: { type: String, required: true, trim: true },
  authority: {
    type: String,
    required: true,
    enum: Object.values(Authority),
    trim: true
  },
  city: { type: String, required: true },
  jurisdiction: {
    type: String,
    required: true,
    trim: true,
    enum: Object.values(Jurisdiction)
  },
  address: { type: String, required: true, trim: true },
  licenseCopies: [
    { type: String, required: true, validate: [validator.isURL, 'Invalid URL'] }
  ],
  license: { type: String, trim: true, required: true },
  licenseExpiryDate: { type: Date, required: true },
  watermark: { type: String, trim: true }
}).add(baseSchema)

companySchema.methods.toJSON = function () {
  const company = baseSchema.methods.toJSON.call(this)

  company.owner = serializeExtended(this.owner)
  return company
}
export const CompanyModel = model<ICompanyDocument>(
  Tables.Company,
  companySchema
)
