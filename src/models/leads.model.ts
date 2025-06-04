import { LeadsContactsTypesEnum, LeadsStatusEnum } from '@commonTypes'
import { Tables } from '@constants'
import { ILeadsDocument } from '@contracts'
import { model, Schema, UpdateQuery } from 'mongoose'
import { isEmail } from 'validator'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { InteractionsModel } from './interactions.model'

const leadsSchema = new Schema<ILeadsDocument>({
  name: { type: String },
  user: { type: Schema.Types.ObjectId, ref: Tables.User },
  property: { type: Schema.Types.ObjectId, ref: Tables.Property },
  status: {
    type: String,
    enum: Object.values(LeadsStatusEnum),
    default: LeadsStatusEnum.Pending
  },
  userContactDetails: {
    email: {
      type: String,
      validate: (value: string) => {
        return isEmail(value) || value === '-'
      }
    },
    phone: { type: String },
    whatsapp: { type: String }
  },
  contactType: {
    type: String,
    enum: Object.values(LeadsContactsTypesEnum)
  }
}).add(baseSchema)

async function updateInteractionsClicks(document: ILeadsDocument) {
  const clickMapper = {
    [LeadsContactsTypesEnum.email]: `leadClicks.email`,
    [LeadsContactsTypesEnum.phone]: `leadClicks.phone`,
    [LeadsContactsTypesEnum.whatsapp]: `leadClicks.whatsapp`,
    [LeadsContactsTypesEnum.truedar]: `leadClicks.chat`
  }
  await InteractionsModel.findOneAndUpdate(
    { property: document.property },
    { $inc: { [clickMapper[document.contactType]]: 1 } }
  )
}
async function decreaseInteractionsClicks(document: ILeadsDocument) {
  const clickMapper = {
    [LeadsContactsTypesEnum.email]: `leadClicks.email`,
    [LeadsContactsTypesEnum.phone]: `leadClicks.phone`,
    [LeadsContactsTypesEnum.whatsapp]: `leadClicks.whatsapp`,
    [LeadsContactsTypesEnum.truedar]: `leadClicks.chat`
  }
  await InteractionsModel.findOneAndUpdate(
    { property: document.property },
    { $inc: { [clickMapper[document.contactType]]: -1 } }
  )
}

leadsSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === LeadsStatusEnum.Approved) {
    await updateInteractionsClicks(this)
  }
  next()
})

leadsSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery()
  const update = this.getUpdate() as UpdateQuery<ILeadsDocument> | null
  if (update?.status === LeadsStatusEnum.Approved) {
    const doc: ILeadsDocument | null = await this.model.findOne(query)
    if (doc && doc.status !== LeadsStatusEnum.Approved) {
      await updateInteractionsClicks(doc)
    }
  }
  if (update?.deletedAt) {
    const doc: ILeadsDocument | null = await this.model.findOne(query)
    if (doc && doc.status === LeadsStatusEnum.Approved) {
      await decreaseInteractionsClicks(doc)
    }
  }
  next()
})

leadsSchema.pre('deleteOne', async function (next) {
  const query = this.getQuery()
  const doc: ILeadsDocument | null = await this.model.findOne(query)
  if (doc && doc.status === LeadsStatusEnum.Approved) {
    await decreaseInteractionsClicks(doc)
  }
  next()
})

leadsSchema.methods.toJSON = function () {
  const lead = baseSchema.methods.toJSON.call(this)
  lead.user = serializeExtended(this.user)
  lead.property = serializeExtended(this.property)
  return lead
}

export const LeadsModel = model<ILeadsDocument>(Tables.Leads, leadsSchema)
