import {
  ActionToTakeTypes,
  AddPropertySaveRequest,
  AddPropertySaveResponse,
  DeletePropertySaveRequest,
  DeletePropertySaveResponse,
  FindAllPropertySavesRequestQuery,
  FindAllPropertySavesResponse,
  FindPropertySaveQuery,
  FindPropertySaveRequest,
  FindPropertySaveResponse,
  PropertySave
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IPropertySaveDocument,
  PopulatedPropertySaveDocument
} from '@contracts'
import { propertySaveService, propertyService } from '@services'
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

async function protectProtectSave(save: IPropertySaveDocument, userId: string) {
  if (save.user.toString() !== userId) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 403)
  }
}
class PropertySaveController {
  async read(
    req: Request<any, any, any, FindAllPropertySavesRequestQuery>,
    res: Response<FindAllPropertySavesResponse>
  ) {
    const { page, limit, sort } = getPaginationData(req.query)

    let filter: any = {}

    if (req.query?.filter) {
      filter = buildFilters<PropertySave>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await propertySaveService.findAll<PopulatedPropertySaveDocument>(
        { ...filter },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields
        }
      )
    const serializedResponse = results.map((save) =>
      serializeDto<PropertySave>(save)
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
    req: Request<any, any, AddPropertySaveRequest>,
    res: Response<AddPropertySaveResponse>
  ) {
    // Check if the post exists
    await propertyService.readOne(
      { _id: req.body.property },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    // Check if the save already exists
    await propertySaveService.readOne(
      {
        property: req.body.property,
        user: getLoggedInUserId(req)
      },
      { throwErrorIf: ActionToTakeTypes.Found }
    )
    const payload = {
      ...req.body,
      user: getLoggedInUserId(req)
    }
    const response = await propertySaveService.create(payload, {
      actor: getActorData(req)
    })

    const serializedResponse = serializeDto<PropertySave>(response)
    return await sendSuccessResponse(res, { save: serializedResponse })
  }

  async delete(
    req: Request<any, any, DeletePropertySaveRequest>,
    res: Response<DeletePropertySaveResponse>
  ) {
    const { id } = req.body
    const userId = getLoggedInUserId(req)
    const save = await propertySaveService.readOne(
      {
        $and: [{ property: id }, { user: userId }]
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    await protectProtectSave(save!, userId)
    const deletedSave = await propertySaveService.delete(
      { _id: save?._id },
      { actor: getActorData(req) }
    )
    const serializedResponse = serializeDto<PropertySave>(deletedSave)

    return await sendSuccessResponse(res, { save: serializedResponse })
  }

  async readOne(
    req: Request<FindPropertySaveRequest, any, any, FindPropertySaveQuery>,
    res: Response<FindPropertySaveResponse>,
    next: NextFunction
  ) {
    const saveId = req.params.id
    if (!saveId) {
      return next(new AppError(MESSAGES.SAVES.MISSING_ID, 400))
    }
    const populateFields = populationBuilder(req.query.showFields)

    const save =
      await propertySaveService.readOne<PopulatedPropertySaveDocument>(
        { _id: saveId },
        {
          populateFields,
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )

    const serializedResponse = serializeDto<PropertySave>(save)
    return await sendSuccessResponse(res, { save: serializedResponse })
  }
}

export const propertySavesController = new PropertySaveController()
