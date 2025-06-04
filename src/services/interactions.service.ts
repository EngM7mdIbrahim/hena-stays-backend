import { InteractionsPropertiesAnalytics, UserRole } from '@commonTypes'
import { CreateInteractionsDto, IInteractionsDocument } from '@contracts'
import { InteractionsModel } from '@models'

import { BaseService } from './base.service'

class InteractionsService extends BaseService<
  IInteractionsDocument,
  CreateInteractionsDto
> {
  constructor() {
    super(InteractionsModel)
  }
  async interactionAnalytics(
    filter: Record<string, any> = {}
  ): Promise<InteractionsPropertiesAnalytics> {
    const analytics = await InteractionsModel.aggregate([
      { $match: { ...filter, deletedAt: null } },
      {
        $group: {
          _id: '0',
          views: { $sum: '$views' },
          visitors: { $sum: '$visitors' },

          phone: { $sum: '$leadClicks.phone' },
          whatsapp: { $sum: '$leadClicks.whatsapp' },
          email: { $sum: '$leadClicks.email' },
          chat: { $sum: '$leadClicks.chat' },

          impressions: { $sum: '$impressions' },
          saves: { $sum: '$saves' }
        }
      }
    ])
    const analyticsData: InteractionsPropertiesAnalytics = {
      views: analytics[0]?.views || 0,
      visitors: analytics[0]?.visitors || 0,
      phone: analytics[0]?.phone || 0,
      whatsapp: analytics[0]?.whatsapp || 0,
      email: analytics[0]?.email || 0,
      chat: analytics[0]?.chat || 0,
      impressions: analytics[0]?.impressions || 0,
      saves: analytics[0]?.saves || 0
    }
    return analyticsData
  }

  async getTopPerformers(limit: number = 10) {
    const [topCompanies, topAgents] = await Promise.all([
      // Companies pipeline
      InteractionsModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $lookup: {
            from: 'properties',
            localField: 'property',
            foreignField: '_id',
            as: 'property'
          }
        },
        { $unwind: '$property' },
        {
          $lookup: {
            from: 'companies',
            localField: 'property.company',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $match: { 'company.0': { $exists: true } } },
        {
          $lookup: {
            from: 'users',
            localField: 'company.0.owner',
            foreignField: '_id',
            as: 'companyOwner'
          }
        },
        { $match: { 'companyOwner.0': { $exists: true } } },
        {
          $group: {
            _id: {
              company: { $arrayElemAt: ['$company', 0] },
              owner: { $arrayElemAt: ['$companyOwner', 0] }
            },
            totalImpressions: { $sum: '$impressions' }
          }
        },
        {
          $project: {
            _id: 0,
            user: '$_id.owner',
            company: '$_id.company',
            totalImpressions: 1
          }
        },
        { $sort: { totalImpressions: -1 } },
        { $limit: limit }
      ]),

      // Agents pipeline
      InteractionsModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $lookup: {
            from: 'properties',
            localField: 'property',
            foreignField: '_id',
            as: 'property'
          }
        },
        { $unwind: '$property' },
        {
          $lookup: {
            from: 'users',
            localField: 'property.createdBy',
            foreignField: '_id',
            as: 'agent',
            pipeline: [
              {
                $match: {
                  role: UserRole.Broker,
                  company: { $exists: false }
                }
              }
            ]
          }
        },
        { $match: { 'agent.0': { $exists: true } } },
        {
          $group: {
            _id: { $arrayElemAt: ['$agent', 0] },
            totalImpressions: { $sum: '$impressions' }
          }
        },
        {
          $project: {
            _id: 0,
            user: '$_id',
            totalImpressions: 1
          }
        },
        { $sort: { totalImpressions: -1 } },
        { $limit: limit }
      ])
    ])

    return {
      topCompanies,
      topAgents
    }
  }
}

export const interactionsService = new InteractionsService()
