import { GetUserAnalyticsResponse, User } from '@commonTypes'
import { CreateUserDto, IUserDocument } from '@contracts'
import { UserModel } from '@models'

import { BaseService } from './base.service'

class UserService extends BaseService<IUserDocument, CreateUserDto> {
  constructor() {
    super(UserModel)
  }

  async getRandomUsers(
    filter: Record<string, any>,
    limit = 10
  ): Promise<User[]> {
    return await UserModel.aggregate([
      {
        $match: {
          ...filter,
          deletedAt: null
        }
      },
      {
        $sample: {
          size: limit
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $addFields: {
          company: {
            $first: '$company'
          }
        }
      },
      {
        $lookup: {
          from: 'brokers',
          localField: 'broker',
          foreignField: '_id',
          as: 'broker'
        }
      },
      {
        $addFields: {
          broker: {
            $first: '$broker'
          }
        }
      },

      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 },
          root: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$root', { count: '$count' }] }
        }
      }
    ]).exec()
  }
  async getUsersAnalyticsNumbers(filter: Record<string, any> = {}) {
    const results = await UserModel.aggregate([
      {
        $match: {
          ...filter,
          deletedAt: null
        }
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          roles: [{ $group: { _id: '$role', count: { $sum: 1 } } }]
        }
      }
    ]).exec()
    // results is an array with one element because of the $facet stage.
    const analyticsData: Pick<
      GetUserAnalyticsResponse,
      'totalCount' | 'roles'
    > = {
      totalCount: results[0]?.totalCount[0]?.count || 0,
      roles: results[0]?.roles
    }
    return analyticsData
  }
}

export const internalUserService = new UserService()
export const userService: Omit<UserService, 'delete' | 'deleteMany'> =
  internalUserService
