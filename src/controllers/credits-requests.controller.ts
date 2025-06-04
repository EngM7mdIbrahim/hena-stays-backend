import {
  ActionToTakeTypes,
  CreateCreditResponse,
  CreditRequestStatus,
  CreditsRequest,
  GetAllCreditRequestsQuery,
  GetAllCreditRequestsResponse,
  GetCreditRequestParam,
  GetCreditRequestQuery,
  GetCreditRequestResponse,
  UpdateCreditRequestsBody,
  UpdateCreditRequestsParam,
  UpdateCreditRequestsResponse
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  CreateCreditsRequestDto,
  PopulatedCreditsRequestDocument
} from '@contracts'
import {
  configsService,
  creditsRequestsService,
  emailService,
  subscriptionsService
} from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class CreditsRequestsController {
  async createRequest(
    req: Request<any, CreateCreditResponse, CreateCreditsRequestDto>,
    res: Response<CreateCreditResponse>
  ) {
    const { credits, media } = req.body
    const user = req.user
    const config = await configsService.readOne({}, {})
    const creditsRequest = await creditsRequestsService.createRequest(
      { credits, user: user!._id.toString(), media },
      { actor: getActorData(req) },
      config!.creditsPrice ?? 0
    )
    return sendSuccessResponse(res, {
      creditsRequest: serializeDto<CreditsRequest>(creditsRequest)
    })
  }

  async updateRequestStatus(
    req: Request<UpdateCreditRequestsParam, any, UpdateCreditRequestsBody>,
    res: Response<UpdateCreditRequestsResponse>
  ) {
    const { id } = req.params
    const { status, message } = req.body
    const creditsRequest =
      await creditsRequestsService.readOne<PopulatedCreditsRequestDocument>(
        {
          _id: id
        },
        {
          throwErrorIf: ActionToTakeTypes.NotFound,
          populateFields: ['user']
        }
      )
    if (status === CreditRequestStatus.Rejected) {
      if (!message) {
        throw new AppError(MESSAGES.required('message'), 400)
      }
      const updatedCreditsRequest = await creditsRequestsService.update(
        {
          _id: id
        },
        {
          status
        },
        {
          actor: getActorData(req)
        }
      )
      // send email
      emailService.sendRejectCreditsRequestEmail(
        creditsRequest.user.email,
        creditsRequest.user.name,
        creditsRequest.credits,
        message
      )
      return await sendSuccessResponse(
        res,
        {
          creditsRequest: serializeDto<CreditsRequest>(updatedCreditsRequest)
        },
        200,
        req
      )
    }
    const subscription = await subscriptionsService.readOne(
      {
        _id: creditsRequest.user.subscription
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (status === CreditRequestStatus.Accepted) {
      await subscriptionsService.update(
        {
          _id: subscription._id
        },
        {
          $inc: {
            credits: creditsRequest.credits
          }
        },
        {
          actor: getActorData(req),
          session: req.dbSession!
        }
      )
      const updatedCreditsRequest = await creditsRequestsService.update(
        {
          _id: id
        },
        {
          status
        },
        {
          actor: getActorData(req),
          session: req.dbSession!
        }
      )
      // send email
      emailService.sendAcceptCreditsRequestEmail(
        creditsRequest.user.email,
        creditsRequest.user.name,
        creditsRequest.credits
      )

      return await sendSuccessResponse(
        res,
        {
          creditsRequest: serializeDto<CreditsRequest>(updatedCreditsRequest)
        },
        200,
        req
      )
    }
    return await sendSuccessResponse(
      res,
      {
        creditsRequest: serializeDto<CreditsRequest>(creditsRequest)
      },
      200,
      req
    )
  }

  async getAllRequests(
    req: Request<any, any, any, GetAllCreditRequestsQuery>,
    res: Response<GetAllCreditRequestsResponse>
  ) {
    const { limit, page, filter, sort } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)
    const requests = await creditsRequestsService.findAll(
      {
        ...filter
      },
      { limit, page, sort, populateFields }
    )
    return sendSuccessResponse(res, {
      items: requests.results.map((request) =>
        serializeDto<CreditsRequest>(request)
      ),
      total: requests.totalResults,
      totalPages: requests.totalPages,
      page: requests.page,
      limit: requests.limit
    })
  }

  async getRequest(
    req: Request<GetCreditRequestParam, any, any, GetCreditRequestQuery>,
    res: Response<GetCreditRequestResponse>
  ) {
    const { id } = req.params
    const populateFields = populationBuilder(req.query.showFields)
    const request = await creditsRequestsService.readOne(
      {
        _id: id
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    return sendSuccessResponse(res, {
      creditsRequest: serializeDto<CreditsRequest>(request)
    })
  }
}

export const creditsRequestsController = new CreditsRequestsController()
