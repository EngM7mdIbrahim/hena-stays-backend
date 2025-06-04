import {
  ActionToTakeTypes,
  CreateOfficialBlogRequest,
  CreateOfficialBlogResponse,
  DeleteOfficialBlogRequest,
  DeleteOfficialBlogResponse,
  FindAllOfficialBlogsRequestQuery,
  FindAllOfficialBlogsResponse,
  FindOneOfficialBlogBySlugQuery,
  FindOneOfficialBlogBySlugRequestParams,
  FindOneOfficialBlogBySlugResponse,
  FindOneOfficialBlogQuery,
  FindOneOfficialBlogRequestParams,
  FindOneOfficialBlogResponse,
  OfficialBlog,
  UpdateOfficialBlogRequest,
  UpdateOfficialBlogResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IUserDocument,
  PopulatedOfficialBlogDocument
} from '@contracts'
import { officialBlogService } from '@services'
import { NextFunction, Request, Response } from 'express'
import { RootFilterQuery } from 'mongoose'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

async function filterProtection(
  filter: RootFilterQuery<OfficialBlog>,
  user?: IUserDocument
): Promise<RootFilterQuery<OfficialBlog>> {
  if (
    user &&
    (user?.role === UserRole.Admin || user?.role === UserRole.AdminViewer)
  ) {
    return filter
  } else {
    return {
      ...filter,
      published: true
    }
  }
}

class OfficialBlogController {
  async create(
    req: Request<any, any, CreateOfficialBlogRequest>,
    res: Response<CreateOfficialBlogResponse>
  ) {
    const payload = {
      ...req.body,
      user: getLoggedInUserId(req)
    }
    const response = await officialBlogService.create(payload, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<OfficialBlog>(response)
    return await sendSuccessResponse(res, { officialBlog: serializedResponse })
  }

  async update(
    req: Request<
      Pick<UpdateOfficialBlogRequest, 'id'>,
      any,
      Omit<UpdateOfficialBlogRequest, 'id'>
    >,
    res: Response<UpdateOfficialBlogResponse>,
    next: NextFunction
  ) {
    const { id: officialBlogId } = req.params
    if (!officialBlogId) {
      return next(new AppError(MESSAGES.missingData('id'), 400))
    }
    const response = await officialBlogService.update(
      { _id: officialBlogId },
      req.body,
      {
        actor: getActorData(req)
      }
    )

    const serializedResponse = serializeDto<OfficialBlog>(response)
    return await sendSuccessResponse(res, { officialBlog: serializedResponse })
  }

  async delete(
    req: Request<DeleteOfficialBlogRequest>,
    res: Response<DeleteOfficialBlogResponse>,
    next: NextFunction
  ) {
    const { id: officialBlogId } = req.params
    if (!officialBlogId) {
      return next(new AppError(MESSAGES.missingData('id'), 400))
    }
    const deletedOfficialBlog = await officialBlogService.delete(
      {
        _id: officialBlogId
      },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<OfficialBlog>(deletedOfficialBlog)

    return await sendSuccessResponse(res, { officialBlog: serializedResponse })
  }

  async readOne(
    req: Request<
      FindOneOfficialBlogRequestParams,
      any,
      any,
      FindOneOfficialBlogQuery
    >,
    res: Response<FindOneOfficialBlogResponse>,
    next: NextFunction
  ) {
    const { id: officialBlogId } = req.params
    if (!officialBlogId) {
      return next(new AppError(MESSAGES.missingData('id'), 400))
    }
    const populateFields = populationBuilder(req.query.showFields)
    const filter = await filterProtection({ _id: officialBlogId }, req.user)
    const officialBlog =
      await officialBlogService.readOne<PopulatedOfficialBlogDocument>(
        { ...filter },
        {
          populateFields,
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )

    const serializedResponse = serializeDto<OfficialBlog>(officialBlog)
    return await sendSuccessResponse(res, { officialBlog: serializedResponse })
  }

  async read(
    req: Request<any, any, any, FindAllOfficialBlogsRequestQuery>,
    res: Response<FindAllOfficialBlogsResponse>
  ) {
    const {
      page,
      limit,
      sort,
      filter: preFilter
    } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const filter = await filterProtection(preFilter, req.user)

    const { results, totalPages, totalResults } =
      await officialBlogService.findAll<PopulatedOfficialBlogDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )
    const serializedResponse = results.map((result) =>
      serializeDto<OfficialBlog>(result)
    )
    sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
    res.locals.officialBlogs = results
  }

  async readBySlug(
    req: Request<
      FindOneOfficialBlogBySlugRequestParams,
      any,
      any,
      FindOneOfficialBlogBySlugQuery
    >,
    res: Response<FindOneOfficialBlogBySlugResponse>,
    next: NextFunction
  ) {
    const { slug } = req.params
    if (!slug) {
      return next(new AppError(MESSAGES.missingData('id'), 400))
    }
    const populateFields = populationBuilder(req.query.showFields)
    const filter = await filterProtection({ slug }, req.user)
    const officialBlog = await officialBlogService.readOne(
      { ...filter },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const serializedResponse = serializeDto<OfficialBlog>(officialBlog)
    return await sendSuccessResponse(res, { officialBlog: serializedResponse })
  }
}

export const officialBlogController = new OfficialBlogController()
