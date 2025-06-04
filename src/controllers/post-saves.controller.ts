import {
  ActionToTakeTypes,
  AddPostSaveRequest,
  AddPostSaveResponse,
  DeletePostSaveRequest,
  DeletePostSaveResponse,
  FindAllPostSavesRequestQuery,
  FindAllPostSavesResponse,
  FindPostSaveRequest,
  FindPostSaveResponse,
  Post,
  PostSave
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IPostDocument,
  IPostSaveDocument,
  PopulatedPostSaveDocument
} from '@contracts'
import {
  followService,
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

async function protectPostSave(save: IPostSaveDocument, userId: string) {
  if (save.user.toString() !== userId) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}

const addPostsMeta = (
  results: IPostDocument[],
  req: Request<any, any, any, FindAllPostSavesRequestQuery>
) => {
  return Promise.all(
    results.map(async (post) => {
      const serializedPost = serializeDto<Post>(post)
      const isLikedByMe = (await likeService.readOne({
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
        isFollowedByMe
      }
    })
  )
}

class PostSaveController {
  async read(
    req: Request<any, any, any, FindAllPostSavesRequestQuery>,
    res: Response<FindAllPostSavesResponse>
  ) {
    const { page, limit, sort } = getPaginationData(req.query)

    let filter: any = {}

    if (req.query?.filter) {
      filter = buildFilters<PostSave>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await postSaveService.findAll<PopulatedPostSaveDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )
    const posts = results.map((result) => result.post)
    const populatedPosts = await addPostsMeta(posts, req)

    return sendSuccessResponse(res, {
      items: populatedPosts,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }
  async create(
    req: Request<any, any, AddPostSaveRequest>,
    res: Response<AddPostSaveResponse>
  ) {
    // Check if the post exists
    await postService.readOne(
      { _id: req.body.post },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    // Check if the save already exists
    await postSaveService.readOne(
      {
        post: req.body.post,
        user: getLoggedInUserId(req)
      },
      { throwErrorIf: ActionToTakeTypes.Found }
    )
    const payload = {
      ...req.body,
      user: getLoggedInUserId(req)
    }
    const response = await postSaveService.create(payload, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<PostSave>(response)
    return await sendSuccessResponse(res, { save: serializedResponse })
  }

  async delete(
    req: Request<any, any, DeletePostSaveRequest>,
    res: Response<DeletePostSaveResponse>
  ) {
    const { id } = req.body
    const userId = getLoggedInUserId(req)
    const save = await postSaveService.readOne(
      {
        $and: [{ post: id }, { user: userId }]
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectPostSave(save!, userId)
    const deletedSave = await postSaveService.delete(
      { _id: save?._id },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<PostSave>(deletedSave)

    return await sendSuccessResponse(res, { save: serializedResponse })
  }

  async readOne(
    req: Request<FindPostSaveRequest>,
    res: Response<FindPostSaveResponse>,
    next: NextFunction
  ) {
    const saveId = req.params.id
    if (!saveId) {
      return next(new AppError(MESSAGES.SAVES.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const save = await postSaveService.readOne<PopulatedPostSaveDocument>(
      { _id: saveId },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    const serializedResponse = serializeDto<PostSave>(save)
    return await sendSuccessResponse(res, { save: serializedResponse })
  }
}

export const postsSavesController = new PostSaveController()
