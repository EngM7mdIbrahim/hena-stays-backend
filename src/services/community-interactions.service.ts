import {
  CreateCommunityInteractionsDto,
  ICommunityInteractionsDocument
} from '@contracts'
import { CommunityInteractionsModel } from '@models'

import { BaseService } from './base.service'

export class CommunityInteractionsService extends BaseService<
  ICommunityInteractionsDocument,
  CreateCommunityInteractionsDto
> {
  constructor() {
    super(CommunityInteractionsModel)
  }

  async interactionAnalytics(filter: Record<string, any> = {}) {
    const analytics = await CommunityInteractionsModel.aggregate([
      { $match: { ...filter, deletedAt: null } },
      {
        $group: {
          _id: '0',
          views: { $sum: '$views' },
          visitors: { $sum: '$visitors' },
          impressions: { $sum: '$impressions' },
          saves: { $sum: '$saves' }
        }
      }
    ])
    const analyticsData = {
      views: analytics[0]?.views || 0,
      visitors: analytics[0]?.visitors || 0,
      impressions: analytics[0]?.impressions || 0,
      saves: analytics[0]?.saves || 0
    }
    return analyticsData
  }
}

export const communityInteractionsService = new CommunityInteractionsService()
