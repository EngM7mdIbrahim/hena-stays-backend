import {
  ActionToTakeTypes,
  Comment,
  GetAnalyticsQuery,
  GetCommunityAnalyticsResponse,
  GetLatestCommentsResponse,
  GetPropertiesAnalyticsResponse,
  GetUserAnalyticsResponse,
  LeadsStatusEnum,
  ProfileInteractions,
  Property,
  UserRole
} from '@commonTypes'
import { IUserDocument, PopulatedInteractionsDocument } from '@contracts'
import {
  commentService,
  communityInteractionsService,
  interactionsService,
  leadsService,
  postService,
  profileInteractionsService,
  propertyService,
  userService
} from '@services'
import { Request, Response } from 'express'

import { sendSuccessResponse, serializeDto } from '@utils'

async function filterProtection(
  user?: IUserDocument,
  filter?: GetAnalyticsQuery['filter']
) {
  if (user?.role === UserRole.Company || user?.role === UserRole.CompanyAdmin) {
    if (filter && filter._id) {
      const checkIfUserBelongsToCompany = await userService.readOne(
        {
          _id: filter._id,
          company: user?.company
        },
        {
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )
      return {
        createdBy: checkIfUserBelongsToCompany._id
      }
    } else {
      return {
        company: user?.company
      }
    }
  }
  if (user?.role === UserRole.Broker || user?.role === UserRole.Agent) {
    return {
      createdBy: user?._id
    }
  }
  // If admin roles
  return {}
}
class AnalyticsController {
  async propertiesAnalytics(
    req: Request<any, any, any, GetAnalyticsQuery>,
    res: Response<GetPropertiesAnalyticsResponse>
  ) {
    const filter = await filterProtection(req.user, req.query?.filter)
    const propertiesAnalytics =
      await propertyService.propertiesAnalytics(filter)
    const prePropertiesIds = await propertyService.findAll(
      {
        ...filter
      },
      {
        select: '_id',
        populateFields: [],
        limit: Number.MAX_SAFE_INTEGER
      }
    )
    const propertiesIds = prePropertiesIds.results.map(
      (property) => property._id
    )
    const interactionsAnalytics =
      await interactionsService.interactionAnalytics({
        property: { $in: propertiesIds }
      })
    const interactions = (
      await interactionsService.findAll<PopulatedInteractionsDocument>(
        {
          property: { $in: propertiesIds }
        },
        {
          populateFields: [
            {
              path: 'property',
              populate: [
                {
                  path: 'company'
                },
                {
                  path: 'createdBy'
                },
                {
                  path: 'category'
                },
                {
                  path: 'subCategory'
                },
                {
                  path: 'amenities.basic'
                }
              ]
            }
          ],
          sort: { visitors: -1 },
          limit: 3
        }
      )
    ).results
    const totalLeads = await leadsService.count({
      filter: {
        property: { $in: propertiesIds },
        status: LeadsStatusEnum.Approved
      }
    })
    let conversionRate = 0
    if (interactionsAnalytics.visitors !== 0) {
      conversionRate = Math.ceil(
        (totalLeads / interactionsAnalytics.visitors) * 100
      )
    }
    return sendSuccessResponse(res, {
      propertiesAnalytics,
      interactionsAnalytics,
      totalLeads,
      conversionRate,
      topPerformers: interactions.map((interaction) => {
        const property = serializeDto<Property>(interaction.property!)
        return {
          ...property,
          interaction: {
            visitors: interaction.visitors,
            leadClicks: interaction.leadClicks,
            impressions: interaction.impressions,
            saves: interaction.saves,
            views: interaction.views,
            property: interaction.property!._id.toString(),
            _id: interaction._id.toString(),
            createdAt: interaction.createdAt
          }
        }
      })
    })
  }
  async userAnalytics(req: Request, res: Response<GetUserAnalyticsResponse>) {
    const filter = await filterProtection(req.user)
    const userAnalytics = await userService.getUsersAnalyticsNumbers(filter)
    return sendSuccessResponse(res, userAnalytics)
  }

  async latestComments(
    req: Request<any, any, any, GetAnalyticsQuery>,
    res: Response<GetLatestCommentsResponse>
  ) {
    let filter: any = await filterProtection(req.user, req.query?.filter)
    if (filter.createdBy) {
      filter = {
        _id: filter.createdBy
      }
    }
    const users = await userService.findAll(
      {
        ...filter
      },
      {
        select: '_id',
        populateFields: [],
        limit: Number.MAX_SAFE_INTEGER
      }
    )
    const userIds = users.results.map((user) => user._id)
    const posts = await postService.findAll(
      {
        user: { $in: userIds }
      },
      {
        select: '_id',
        populateFields: [],
        limit: Number.MAX_SAFE_INTEGER
      }
    )
    const postIds = posts.results.map((post) => post._id)
    const comments = await commentService.findAll(
      {
        post: { $in: postIds }
      },
      {
        sort: { createdAt: -1 },
        limit: 10,
        populateFields: ['user', 'post']
      }
    )
    return sendSuccessResponse(res, {
      comments: comments.results.map((comment) =>
        serializeDto<Comment>(comment)
      )
    })
  }

  async communityInteractions(
    req: Request<any, any, any, GetAnalyticsQuery>,
    res: Response<GetCommunityAnalyticsResponse>
  ) {
    let filter: any = await filterProtection(req.user, req.query?.filter)
    if (filter.createdBy) {
      filter = {
        _id: filter.createdBy
      }
    }
    const users = await userService.findAll(
      {
        ...filter
      },
      {
        select: '_id',
        populateFields: [],
        limit: Number.MAX_SAFE_INTEGER
      }
    )
    const userIds = users.results.map((user) => user._id)
    const posts = await postService.findAll(
      {
        user: { $in: userIds }
      },
      {
        select: '_id',
        populateFields: [],
        limit: Number.MAX_SAFE_INTEGER
      }
    )
    const postIds = posts.results.map((post) => post._id)
    const interactionsAnalytics =
      await communityInteractionsService.interactionAnalytics({
        post: { $in: postIds }
      })
    const profileViews = await profileInteractionsService.readOne({
      user: req.user?._id
    })

    return sendSuccessResponse(res, {
      postsInteractions: interactionsAnalytics,
      profileViews: serializeDto<ProfileInteractions>(profileViews!)
    })
  }
}
export const analyticsController = new AnalyticsController()
