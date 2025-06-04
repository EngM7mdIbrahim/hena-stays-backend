import {
  ActionToTakeTypes,
  CreatePostRequest,
  CreatePostResponse,
  DeletePostRequest,
  DeletePostResponse,
  FindAllPostsRequestQuery,
  FindAllPostsResponse,
  FindOnePostQuery,
  FindPostRequestParams,
  FindPostResponse,
  Post,
  UpdatePostRequest,
  UpdatePostResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IPostDocument,
  IUserDocument,
  PopulatedPostDocument
} from '@contracts'
import {
  followService,
  likeService,
  postSaveService,
  postService
} from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

const protectPost = async (post: IPostDocument, user: IUserDocument) => {
  if (
    post.user.toString() !== user._id.toString() &&
    user.role !== UserRole.Admin
  ) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}

const addPostsMeta = (
  results: PopulatedPostDocument[],
  req: Request<any, any, any, FindAllPostsRequestQuery>
) => {
  return Promise.all(
    results.map(async (post) => {
      const serializedPost = serializeDto<Post>(post)
      const isLikedByMe = (await likeService.readOne({
        $and: [{ post: post }, { user: getLoggedInUserId(req) }]
      }))
        ? true
        : false
      const isSavedByMe = (await postSaveService.readOne({
        $and: [{ post: post }, { user: getLoggedInUserId(req) }]
      }))
        ? true
        : false
      const isFollowedByMe = (await followService.readOne({
        $and: [{ follower: getLoggedInUserId(req) }, { following: post.user }]
      }))
        ? true
        : false
      return {
        ...serializedPost,
        isLikedByMe,
        isSavedByMe,
        isFollowedByMe
      }
    })
  )
}

class PostController {
  async create(
    req: Request<any, any, CreatePostRequest>,
    res: Response<CreatePostResponse>
  ) {
    const payload = {
      ...req.body,
      user: getLoggedInUserId(req)
    }
    const response = await postService.create(payload, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<Post>(response)
    return await sendSuccessResponse(res, { post: serializedResponse })
  }

  async update(
    req: Request<
      Pick<UpdatePostRequest, 'id'>,
      any,
      Omit<UpdatePostRequest, 'id'>
    >,
    res: Response<UpdatePostResponse>,
    next: NextFunction
  ) {
    const { id: postId } = req.params
    if (!postId) {
      return next(new AppError(MESSAGES.POSTS.MISSING_ID, 400))
    }
    const post = await postService.readOne(
      {
        _id: postId
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectPost(post!, req.user!)

    const response = await postService.update({ _id: postId }, req.body, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<Post>(response)
    return await sendSuccessResponse(res, { post: serializedResponse })
  }

  async delete(
    req: Request<DeletePostRequest>,
    res: Response<DeletePostResponse>,
    next: NextFunction
  ) {
    const { id: postId } = req.params
    if (!postId) {
      return next(new AppError(MESSAGES.POSTS.MISSING_ID, 400))
    }
    const post = await postService.readOne(
      {
        _id: postId
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectPost(post!, req.user!)
    const deletedPost = await postService.delete(
      {
        _id: postId
      },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<Post>(deletedPost)

    return await sendSuccessResponse(res, { post: serializedResponse })
  }

  async readOne(
    req: Request<FindPostRequestParams, any, any, FindOnePostQuery>,
    res: Response<FindPostResponse>,
    next: NextFunction
  ) {
    const { id: postId } = req.params
    if (!postId) {
      return next(new AppError(MESSAGES.POSTS.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const post = await postService.readOne<PopulatedPostDocument>(
      { _id: postId },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    const serializedResponse = (await addPostsMeta([post!], req))[0]!
    return await sendSuccessResponse(res, { post: serializedResponse })
  }

  async read(
    req: Request<any, any, any, FindAllPostsRequestQuery>,
    res: Response<FindAllPostsResponse>
  ) {
    const { page, limit, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await postService.findAll<PopulatedPostDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )
    const serializedResponse = await addPostsMeta(results, req)
    sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
    res.locals.posts = results
  }
}

export const postController = new PostController()
