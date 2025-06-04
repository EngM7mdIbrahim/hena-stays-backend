import {
  ActionToTakeTypes,
  Category,
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryParams,
  DeleteCategoryResponse,
  GetAllCategoryQuery,
  GetAllCategoryResponse,
  GetCategoryParams,
  GetCategoryQuery,
  GetCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryRequestParams,
  UpdateCategoryResponse
} from '@commonTypes'
import { categoryService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class CategoryController {
  async getAll(
    req: Request<any, any, any, GetAllCategoryQuery>,
    res: Response<GetAllCategoryResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const categories = await categoryService.findAll(filter, {
      limit,
      page,
      sort
    })
    sendSuccessResponse(res, {
      items: categories.results.map((category) =>
        serializeDto<Category>(category)
      ),
      total: categories.totalResults,
      limit,
      page,
      totalPages: categories.totalPages,
      hasNext: categories.page < categories.totalPages,
      nextPage:
        categories.page < categories.totalPages
          ? categories.page + 1
          : undefined
    })
  }

  async getOne(
    req: Request<GetCategoryParams, any, any, GetCategoryQuery>,
    res: Response<GetCategoryResponse>
  ) {
    const category = await categoryService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, {
      category: serializeDto<Category>(category)
    })
  }

  async create(
    req: Request<any, any, CreateCategoryRequest>,
    res: Response<CreateCategoryResponse>
  ) {
    const category = await categoryService.create(req.body, {
      actor: getActorData(req)
    })
    sendSuccessResponse(res, { category: serializeDto<Category>(category) })
  }

  async update(
    req: Request<UpdateCategoryRequestParams, any, UpdateCategoryRequest>,
    res: Response<UpdateCategoryResponse>
  ) {
    let category = await categoryService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    await categoryService.update({ _id: req.params.id }, req.body, {
      actor: getActorData(req)
    })
    category = await categoryService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { category: serializeDto<Category>(category) })
  }

  async delete(
    req: Request<DeleteCategoryParams>,
    res: Response<DeleteCategoryResponse>
  ) {
    const category = await categoryService.delete(
      { _id: req.params.id },
      { actor: getActorData(req) }
    )
    sendSuccessResponse(
      res,
      { category: serializeDto<Category>(category) },
      204
    )
  }
}

export const categoryController = new CategoryController()
