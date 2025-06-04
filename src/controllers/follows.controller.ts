import { notificationDeviceCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  CreateFollowRequest,
  CreateFollowResponse,
  DeleteFollowRequest,
  DeleteFollowResponse,
  FindAllFollowsRequestQuery,
  FindAllFollowsResponse,
  FindFollowRequest,
  FindFollowResponse,
  Follow,
  NotificationTitles,
  NotificationTypes,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError, IFollowDocument, PopulatedFollowDocument } from '@contracts'
import { followService, userService } from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

const protectFollow = async (follow: IFollowDocument, followerId: string) => {
  if (follow.follower.toString() !== followerId) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}

class FollowsController {
  async read(
    req: Request<any, any, any, FindAllFollowsRequestQuery>,
    res: Response<FindAllFollowsResponse>
  ) {
    const { page, limit, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await followService.findAll<PopulatedFollowDocument>(filter, {
        sort: sort ?? { createdAt: -1 },
        limit,
        page,
        populateFields
      })
    const serializedResponse = results.map((follow) =>
      serializeDto<Follow>(follow)
    )

    return sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }

  async create(
    req: Request<any, any, CreateFollowRequest>,
    res: Response<CreateFollowResponse>,
    next: NextFunction
  ) {
    const followingId = req.body.following
    const followerId = getLoggedInUserId(req)

    if (followerId === followingId) {
      return next(new AppError(MESSAGES.FOLLOWS.SELF_FOLLOW, 400))
    }

    const userFollowed = await userService.readOne(
      { _id: followingId },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (userFollowed!.role === UserRole.User) {
      return next(new AppError(MESSAGES.FOLLOWS.USER_FOLLOW, 400))
    }
    await followService.readOne(
      { follower: followerId, following: followingId },
      { throwErrorIf: ActionToTakeTypes.Found }
    )

    const response = await followService.create(
      {
        follower: followerId,
        following: followingId
      },
      { actor: getActorData(req) }
    )

    notificationDeviceCombinedService.sendPushNotificationToUser(
      NotificationTypes.Follow,
      {
        userId: followingId,
        notificationData: {
          title: NotificationTitles.Follow,
          body: MESSAGES.NOTIFICATIONS.newFollow(req.user!.name),
          payload: {
            following: followingId,
            follower: followerId
          }
        }
      }
    )
    const serializedResponse = serializeDto<Follow>(response)

    return await sendSuccessResponse(res, { follow: serializedResponse })
  }

  async readOne(
    req: Request<FindFollowRequest, any, any>,
    res: Response<FindFollowResponse>,
    next: NextFunction
  ) {
    const followId = req.params.id
    if (!followId) {
      return next(new AppError(MESSAGES.FOLLOWS.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const follow = await followService.readOne<PopulatedFollowDocument>(
      { _id: followId },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (!follow) {
      return next(new AppError(MESSAGES.FOLLOWS.NOT_FOUND, 404))
    }

    const serializedResponse = serializeDto<Follow>(follow)
    return await sendSuccessResponse(res, { follow: serializedResponse })
  }

  async delete(
    req: Request<any, any, DeleteFollowRequest>,
    res: Response<DeleteFollowResponse>
  ) {
    const { following } = req.body
    const followerId = getLoggedInUserId(req)
    const follow = await followService.readOne(
      { following },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (follow) {
      await protectFollow(follow, followerId)
    }

    const deletedFollow = await followService.delete(
      { following, follower: followerId },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<Follow>(deletedFollow)

    return await sendSuccessResponse(res, { follow: serializedResponse })
  }
}

export const followsController = new FollowsController()
