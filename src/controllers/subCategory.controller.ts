import {
  ActionToTakeTypes,
  CreateSubCategoryRequest,
  CreateSubCategoryResponse,
  DeleteSubCategoryRequestParams,
  DeleteSubCategoryResponse,
  GetAllSubCategoriesQuery,
  GetAllSubCategoriesResponse,
  GetOneSubCategoryRequestParams,
  GetOneSubCategoryRequestQuery,
  GetOneSubCategoryResponse,
  SubCategory,
  UpdateSubCategoryRequest,
  UpdateSubCategoryRequestParams,
  UpdateSubCategoryResponse
} from '@commonTypes'
import { PopulatedSubCategoryDocument } from '@contracts'
import { subCategoryService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class SubCategoryController {
  async createSubCategory(
    req: Request<any, any, CreateSubCategoryRequest>,
    res: Response<CreateSubCategoryResponse>
  ) {
    const subCategory = await subCategoryService.create(req.body, {
      actor: getActorData(req)
    })
    return sendSuccessResponse(res, {
      subCategory: serializeDto<SubCategory>(subCategory)
    })
  }

  async getAllSubCategories(
    req: Request<any, any, any, GetAllSubCategoriesQuery>,
    res: Response<GetAllSubCategoriesResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const subCategories =
      await subCategoryService.findAll<PopulatedSubCategoryDocument>(filter, {
        limit,
        page,
        sort,
        populateFields
      })
    return sendSuccessResponse(res, {
      items: subCategories.results.map((subCategory) =>
        serializeDto<SubCategory>(subCategory)
      ),
      total: subCategories.totalResults,
      limit: subCategories.limit,
      page: subCategories.page,
      totalPages: subCategories.totalPages
    })
  }
  async getOneSubCategory(
    req: Request<
      GetOneSubCategoryRequestParams,
      any,
      any,
      GetOneSubCategoryRequestQuery
    >,
    res: Response<GetOneSubCategoryResponse>
  ) {
    const subCategory =
      await subCategoryService.readOne<PopulatedSubCategoryDocument>(
        { _id: req.params.id },
        {
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )
    return sendSuccessResponse(res, {
      subCategory: serializeDto<SubCategory>(subCategory!)
    })
  }

  async updateSubCategory(
    req: Request<UpdateSubCategoryRequestParams, any, UpdateSubCategoryRequest>,
    res: Response<UpdateSubCategoryResponse>
  ) {
    const subCategory = await subCategoryService.update(
      { _id: req.params.id },
      req.body,
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      subCategory: serializeDto<SubCategory>(subCategory)
    })
  }

  async deleteSubCategory(
    req: Request<DeleteSubCategoryRequestParams>,
    res: Response<DeleteSubCategoryResponse>
  ) {
    const subCategory = await subCategoryService.delete(
      {
        _id: req.params.id
      },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      subCategory: serializeDto<SubCategory>(subCategory)
    })
  }
}

export const subCategoryController = new SubCategoryController()
