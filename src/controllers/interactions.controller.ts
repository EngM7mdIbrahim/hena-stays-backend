import {
  ActionToTakeTypes,
  CreateInteractionsRequest,
  CreateInteractionsResponse,
  DeleteInteractionsRequestParams,
  DeleteInteractionsResponse,
  GetAllInteractionsQuery,
  GetAllInteractionsResponse,
  GetOneInteractionsRequestParams,
  GetOneInteractionsRequestQuery,
  GetOneInteractionsResponse,
  Interactions,
  UpdateInteractionsRequest,
  UpdateInteractionsRequestParams,
  UpdateInteractionsResponse
} from '@commonTypes'
import { PopulatedInteractionsDocument } from '@contracts'
import { interactionsService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class InteractionsController {
  async createInteractions(
    req: Request<any, any, CreateInteractionsRequest>,
    res: Response<CreateInteractionsResponse>
  ) {
    const interaction = await interactionsService.create(req.body, {
      actor: getActorData(req)
    })
    return sendSuccessResponse(res, {
      interaction: serializeDto<Interactions>(interaction)
    })
  }

  async getAllInteractions(
    req: Request<any, any, any, GetAllInteractionsQuery>,
    res: Response<GetAllInteractionsResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const subCategories =
      await interactionsService.findAll<PopulatedInteractionsDocument>(filter, {
        limit,
        page,
        sort,
        populateFields
      })
    return sendSuccessResponse(res, {
      items: subCategories.results.map((interaction) =>
        serializeDto<Interactions>(interaction)
      ),
      total: subCategories.totalResults,
      limit: subCategories.limit,
      page: subCategories.page,
      totalPages: subCategories.totalPages
    })
  }
  async getOneInteractions(
    req: Request<
      GetOneInteractionsRequestParams,
      any,
      any,
      GetOneInteractionsRequestQuery
    >,
    res: Response<GetOneInteractionsResponse>
  ) {
    const interaction =
      await interactionsService.readOne<PopulatedInteractionsDocument>(
        { _id: req.params.id },
        {
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      )
    return sendSuccessResponse(res, {
      interaction: serializeDto<Interactions>(interaction!)
    })
  }

  async updateInteractions(
    req: Request<
      UpdateInteractionsRequestParams,
      any,
      UpdateInteractionsRequest
    >,
    res: Response<UpdateInteractionsResponse>
  ) {
    const interaction = await interactionsService.update(
      { _id: req.params.id },
      req.body,
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      interaction: serializeDto<Interactions>(interaction)
    })
  }

  async deleteInteractions(
    req: Request<DeleteInteractionsRequestParams>,
    res: Response<DeleteInteractionsResponse>
  ) {
    const interaction = await interactionsService.delete(
      {
        _id: req.params.id
      },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      interaction: serializeDto<Interactions>(interaction)
    })
  }
}

export const interactionController = new InteractionsController()
