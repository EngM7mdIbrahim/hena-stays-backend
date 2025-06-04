import { notificationDeviceCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  CreateLikeRequest,
  CreateLikeResponse,
  DeleteLikeRequest,
  DeleteLikeResponse,
  FindAllLikesRequestQuery,
  FindAllLikesResponse,
  FindLikeRequest,
  FindLikeResponse,
  FindPostResponse,
  Like,
  NotificationTitles,
  NotificationTypes
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  CreateLikeDto,
  ILikeDocument,
  PopulatedLikeDocument
} from '@contracts'
import {
  commentService,
  likeService,
  postSaveService,
  postService
} from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  buildFilters,
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

const protectLike = async (like: ILikeDocument, userId: string) => {
  if (like.user.toString() !== userId) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}
const serializeLike = async (like: any, userId: string) => {
  const serializedLike = serializeDto<
    Omit<Like, 'post'> & { post?: FindPostResponse['post'] }
  >(like)
  if (serializedLike.post && serializedLike?.post?._id) {
    const isSavedByMe = (await postSaveService.readOne({
      $and: [{ post: like.post._id }, { user: userId }]
    }))
      ? true
      : false

    serializedLike.post.isSavedByMe = isSavedByMe
  }

  return serializedLike
}

class LikeController {
  async read(
    req: Request<any, any, any, FindAllLikesRequestQuery>,
    res: Response<FindAllLikesResponse>
  ) {
    const { page, limit, sort } = getPaginationData(req.query)

    let filter: any = {}
    if (req.query?.filter) {
      filter = buildFilters<Like>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await likeService.findAll<PopulatedLikeDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )
    const serializedResponse = await Promise.all(
      results.map((like) => serializeLike(like, req.user!._id.toString()))
    )

    return sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages: totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }

  async create(
    req: Request<any, any, CreateLikeRequest>,
    res: Response<CreateLikeResponse>,
    next: NextFunction
  ) {
    const { post, comment } = req.body
    const userId = getLoggedInUserId(req)

    // only add like for post or comment not both, !! indicates that the value is boolean
    if (!!post === !!comment) {
      return next(new AppError(MESSAGES.LIKES.ONE_TYPE_ONLY, 400))
    }
    if (post) {
      const postDoc = await postService.readOne(
        { _id: post },
        {
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )
      await likeService.readOne(
        { post, user: userId },
        {
          throwErrorIf: ActionToTakeTypes.Found
        }
      )
      if (postDoc!.user.toString() !== userId) {
        notificationDeviceCombinedService.sendPushNotificationToUser(
          NotificationTypes.Like,
          {
            userId: String(postDoc!.user!._id),
            notificationData: {
              title: NotificationTitles.Like,
              body: MESSAGES.NOTIFICATIONS.newPostLike(req.user!.name),
              payload: {
                post: postDoc!._id.toString(),
                user: req.user!._id.toString()
              }
            }
          }
        )
      }
    } else if (comment) {
      const commentDoc = await commentService.readOne(
        { _id: comment },
        {
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )
      await likeService.readOne(
        { comment, user: userId },
        {
          throwErrorIf: ActionToTakeTypes.Found
        }
      )
      if (commentDoc!.user.toString() !== userId) {
        notificationDeviceCombinedService.sendPushNotificationToUser(
          NotificationTypes.Like,
          {
            userId: String(commentDoc!.user!._id),
            notificationData: {
              title: NotificationTitles.Like,
              body: MESSAGES.NOTIFICATIONS.newCommentLike(req.user!.name),
              payload: {
                comment: commentDoc!._id.toString(),
                user: req.user!._id.toString()
              }
            }
          }
        )
      }
    } else {
      return next(new AppError(MESSAGES.LIKES.UNSUPPORTED_TYPE, 400))
    }
    const payload: CreateLikeDto = {
      user: userId,
      comment,
      post
    }
    const createdLike = await likeService.create(payload, {
      actor: getActorData(req)
    })
    const populateFields = populationBuilder<Like>({
      post: {
        user: true
      },
      comment: {
        user: true
      }
    })
    const response = await likeService.readOne(
      { _id: createdLike._id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    const serializedResponse = await serializeLike(
      response,
      req.user!._id.toString()
    )
    return await sendSuccessResponse(res, { like: serializedResponse })
  }

  async delete(
    req: Request<any, any, DeleteLikeRequest>,
    res: Response<DeleteLikeResponse>
  ) {
    const { id } = req.body
    const like = await likeService.readOne(
      { $or: [{ post: id }, { comment: id }] },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    await protectLike(like!, getLoggedInUserId(req))
    const deletedLikeId = (
      await likeService.delete({ _id: like!._id }, { actor: getActorData(req) })
    ).id
    const populateFields = populationBuilder<Like>({
      post: {
        user: true
      },
      comment: {
        user: true
      }
    })
    const deletedLike = await likeService.readOne(
      { _id: deletedLikeId },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        includeDeleted: true,
        populateFields
      }
    )
    const serializedResponse = await serializeLike(
      deletedLike,
      getLoggedInUserId(req)
    )
    return await sendSuccessResponse(res, { like: serializedResponse })
  }

  async readOne(
    req: Request<FindLikeRequest>,
    res: Response<FindLikeResponse>,
    next: NextFunction
  ) {
    const likeId = req.params.id
    if (!likeId) {
      return next(new AppError(MESSAGES.LIKES.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const like = await likeService.readOne<PopulatedLikeDocument>(
      { _id: likeId },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const serializedResponse = await serializeLike(
      like,
      req.user!._id.toString()
    )
    return await sendSuccessResponse(res, { like: serializedResponse })
  }
}

export const likeController = new LikeController()
