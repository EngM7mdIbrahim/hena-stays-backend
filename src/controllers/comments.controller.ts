import { notificationDeviceCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  Comment,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  FindAllCommentsRequestQuery,
  FindAllCommentsResponse,
  FindCommentQuery,
  FindCommentRequestParams,
  FindCommentResponse,
  NotificationTitles,
  NotificationTypes,
  UpdateCommentRequest,
  UpdateCommentResponse
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  CreateCommentDto,
  ICommentDocument,
  PopulatedCommentDocument
} from '@contracts'
import { commentService, likeService, postService } from '@services'
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

async function protectComment(comment: ICommentDocument, userId: string) {
  if (comment.user.toString() !== userId) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}

class CommentController {
  async read(
    req: Request<any, any, any, FindAllCommentsRequestQuery>,
    res: Response<FindAllCommentsResponse>
  ) {
    const { page, limit, sort } = getPaginationData(req.query)
    let filter: any = {}
    if (req.query?.filter) {
      filter = buildFilters<Comment>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await commentService.findAll<PopulatedCommentDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )

    const serializedResponse = await Promise.all(
      results.map(async (comment) => {
        const serializedComment = serializeDto<Comment>(comment)
        const isLikedByMe = (await likeService.readOne({
          $and: [{ comment: comment._id }, { user: getLoggedInUserId(req) }]
        }))
          ? true
          : false
        return {
          ...serializedComment,
          isLikedByMe
        }
      })
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
    req: Request<any, any, CreateCommentRequest>,
    res: Response<CreateCommentResponse>
  ) {
    const post = await postService.readOne(
      { _id: req.body.post },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const payload: CreateCommentDto = {
      ...req.body,
      user: getLoggedInUserId(req)
    }
    const response = await commentService.create(payload, {
      actor: getActorData(req)
    })
    if (post.user.toString() !== req.user!._id.toString()) {
      notificationDeviceCombinedService.sendPushNotificationToUser(
        NotificationTypes.Comment,
        {
          userId: String(post.user._id),
          notificationData: {
            title: NotificationTitles.Comment,
            body: MESSAGES.NOTIFICATIONS.newComment(req.user!.name),
            payload: {
              _id: response._id.toString(),
              post: post._id.toString(),
              user: req.user!._id.toString()
            }
          }
        }
      )
    }
    const serializedResponse = serializeDto<Comment>(response)
    return await sendSuccessResponse(res, { comment: serializedResponse })
  }

  async update(
    req: Request<
      Pick<UpdateCommentRequest, 'id'>,
      any,
      Omit<UpdateCommentRequest, 'id'>
    >,
    res: Response<UpdateCommentResponse>,
    next: NextFunction
  ) {
    const commentId = req.params.id
    if (!commentId) {
      return next(new AppError(MESSAGES.COMMENTS.MISSING_ID, 400))
    }

    const existComment = await commentService.readOne(
      { _id: commentId },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const payload = {
      user: getLoggedInUserId(req),
      ...req.body
    }
    await protectComment(existComment, getLoggedInUserId(req))

    const response = await commentService.update({ _id: commentId }, payload, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<Comment>(response)
    return await sendSuccessResponse(res, { comment: serializedResponse })
  }

  async delete(
    req: Request<DeleteCommentRequest>,
    res: Response<DeleteCommentResponse>
  ) {
    const commentId = req.params.id
    if (!commentId) {
      throw new AppError(MESSAGES.COMMENTS.MISSING_ID, 400)
    }
    const existComment = await commentService.readOne(
      { _id: commentId },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    await protectComment(existComment, getLoggedInUserId(req))
    const deletedComment = await commentService.delete(
      { _id: commentId },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<Comment>(deletedComment)

    return await sendSuccessResponse(res, { comment: serializedResponse })
  }

  async readOne(
    req: Request<FindCommentRequestParams, any, any, FindCommentQuery>,
    res: Response<FindCommentResponse>,
    next: NextFunction
  ) {
    const commentId = req.params.id
    if (!commentId) {
      return next(new AppError(MESSAGES.COMMENTS.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const comment = await commentService.readOne<PopulatedCommentDocument>(
      { _id: commentId },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const serializedResponse = serializeDto<Comment>(comment)

    return await sendSuccessResponse(res, { comment: serializedResponse })
  }
}

export const commentController = new CommentController()
