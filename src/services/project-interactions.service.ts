import {
  CreateProjectInteractionsDto,
  IProjectInteractionsDocument
} from '@contracts'
import { ProjectInteractionsModel } from '@models'

import { BaseService } from './base.service'

class ProjectInteractionsService extends BaseService<
  IProjectInteractionsDocument,
  CreateProjectInteractionsDto
> {
  constructor() {
    super(ProjectInteractionsModel)
  }

  async projectInteractionAnalytics(filter: Record<string, any> = {}) {
    const analytics = await ProjectInteractionsModel.aggregate([
      { $match: { ...filter, deletedAt: null } },
      {
        $group: {
          _id: '0',
          views: { $sum: '$views' },
          visitors: { $sum: '$visitors' },
          impressions: { $sum: '$impressions' }
        }
      }
    ])
    const analyticsData = {
      views: analytics[0]?.views || 0,
      visitors: analytics[0]?.visitors || 0,
      impressions: analytics[0]?.impressions || 0
    }
    return analyticsData
  }
}

export const projectInteractionsService = new ProjectInteractionsService()
