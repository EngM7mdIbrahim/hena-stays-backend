import { ProjectStatusEnum } from '@commonTypes'
import { Tables } from '@constants'
import { IProjectDocument } from '@contracts'
import { model, Schema } from 'mongoose'

import { serializeExtended } from '@utils'

import { baseSchema } from './base.model'
import { locationSchema } from './location.schema'
import { mediaSchema } from './media.schema'
import { ProjectInteractionsModel } from './project-interactions.model'

const projectSchema = new Schema<IProjectDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  media: [mediaSchema],
  location: locationSchema,
  status: {
    type: String,
    trim: true,
    enum: Object.values(ProjectStatusEnum),
    default: ProjectStatusEnum.Hold
  },
  handOverDate: { type: Date, required: true },
  paymentPlan: {
    downPaymentPercentage: { type: Number, min: 0 },
    fullPrice: {
      preHandOverPercentage: { type: Number, min: 0 },
      monthsNumber: { type: Number, min: 0 }
    },
    projectCompletion: [
      {
        mileStonePercentage: { type: String, required: true },
        order: { type: Number, min: 1 },
        preHandOverPercentage: {
          type: Number,
          min: 0
        }
      }
    ],
    onHandOverPercentage: { type: Number, min: 0 },
    postHandOverPercentage: { type: Number, min: 0 }
  },
  units: [
    {
      area: {
        from: { type: Number, min: 0 },
        to: { type: Number, min: 0 }
      },
      price: {
        from: { type: Number, min: 0 },
        to: { type: Number, min: 0 }
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: Tables.Category,
        required: true
      },
      subCategory: {
        type: Schema.Types.ObjectId,
        ref: Tables.SubCategory,
        required: true
      }
    }
  ],
  startingPrice: { type: Number, min: 0, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: Tables.User },
  company: { type: Schema.Types.ObjectId, ref: Tables.Company },
  recommended: { type: Boolean, default: false }
}).add(baseSchema)

projectSchema.index({
  'title': 'text',
  'description': 'text',
  'location': '2dsphere',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})

projectSchema.methods.toJSON = function () {
  const project = baseSchema.methods.toJSON.call(this)
  project.media = project.media.map((_media: any, index: number) =>
    serializeExtended(this.media[index])
  )
  project.location = serializeExtended(this.location)
  project.owner = serializeExtended(this.owner)
  project.company = serializeExtended(this.company)
  project.units = project.units.map((_unit: any, index: number) => {
    _unit.category = serializeExtended(this.units[index].category)
    _unit.subCategory = serializeExtended(this.units[index].subCategory)
    return _unit
  })
  return project
}

projectSchema.index({
  'title': 'text',
  'description': 'text',
  'location.address': 'text',
  'location.name': 'text',
  'location.country': 'text',
  'location.state': 'text',
  'location.city': 'text'
})

projectSchema.pre('save', async function (next) {
  if (this.isNew) {
    await ProjectInteractionsModel.create({
      project: this._id,
      views: 0,
      visitors: 0,
      impressions: 0
    })
  }
  next()
})
export const ProjectModel = model<IProjectDocument>(
  Tables.Project,
  projectSchema
)
