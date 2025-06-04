import {
  ActionToTakeTypes,
  Blog,
  CreateBlogRequest,
  CreateBlogResponse,
  DeleteBlogRequestParams,
  DeleteBlogResponse,
  FindAllBlogsRequestQuery,
  FindAllBlogsResponse,
  FindBlogQuery,
  FindBlogRequestParams,
  FindBlogResponse,
  UpdateBlogRequest,
  UpdateBlogResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IBlogDocument,
  IUserDocument,
  PopulatedBlogDocument
} from '@contracts'
import { blogService } from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

const protectBlog = async (blog: IBlogDocument, user: IUserDocument) => {
  if (user.role === UserRole.Admin) {
    return
  }
  if (blog.user.toString() !== user._id.toString()) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
  return
}
class BlogsController {
  async create(
    req: Request<any, any, CreateBlogRequest>,
    res: Response<CreateBlogResponse>
  ) {
    const response = await blogService.create(
      {
        ...req.body,
        user: getLoggedInUserId(req)
      },
      {
        actor: getActorData(req)
      }
    )

    return sendSuccessResponse(res, { blog: serializeDto<Blog>(response) })
  }

  async update(
    req: Request<any, any, UpdateBlogRequest>,
    res: Response<UpdateBlogResponse>,
    next: NextFunction
  ) {
    const blogId = req.params.id
    if (!blogId) {
      return next(new AppError(MESSAGES.BLOGS.MISSING_ID, 400))
    }
    const blog = await blogService.readOne(
      {
        _id: blogId
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectBlog(blog, req.user!)

    const response = await blogService.update({ _id: blogId }, req.body, {
      actor: getActorData(req)
    })
    return sendSuccessResponse(res, { blog: serializeDto<Blog>(response) })
  }
  async delete(
    req: Request<DeleteBlogRequestParams>,
    res: Response<DeleteBlogResponse>,
    next: NextFunction
  ) {
    const { id: blogId } = req.params
    if (!blogId) {
      return next(new AppError(MESSAGES.BLOGS.MISSING_ID, 400))
    }
    const blog = await blogService.readOne(
      {
        _id: blogId
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectBlog(blog, req.user!)

    const deletedBlog = await blogService.delete(
      { _id: blogId },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, { blog: serializeDto<Blog>(deletedBlog) })
  }
  async readOne(
    req: Request<FindBlogRequestParams, any, any, FindBlogQuery>,
    res: Response<FindBlogResponse>,
    next: NextFunction
  ) {
    const { id } = req.params
    if (!id) {
      return next(new AppError(MESSAGES.BLOGS.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const blog = await blogService.readOne<PopulatedBlogDocument>(
      {
        _id: id
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    return sendSuccessResponse(res, { blog: serializeDto<Blog>(blog) })
  }

  async read(
    req: Request<any, any, any, FindAllBlogsRequestQuery>,
    res: Response<FindAllBlogsResponse>
  ) {
    const { page, limit, sort, filter } = getPaginationData(req.query)

    const populateFields = populationBuilder(req.query.showFields)
    const { results, totalPages, totalResults } = await blogService.findAll<
      Pick<PopulatedBlogDocument, 'user'>
    >(
      { ...filter },
      {
        sort: sort ?? { createdAt: -1 },
        limit,
        page,
        populateFields
      }
    )

    return sendSuccessResponse(res, {
      items: results.map((item) => serializeDto<Blog>(item)),
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }
}

export const blogController = new BlogsController()
