import {
  ActionToTakeTypes,
  CallRequest,
  CallRequestStatus,
  CreateCallRequestRequest,
  CreateCallRequestResponse,
  DeleteCallRequestRequestParams,
  DeleteCallRequestResponse,
  GetAllCallRequestsQuery,
  GetAllCallRequestsResponse,
  GetOneCallRequestRequestParams,
  GetOneCallRequestResponse,
  UpdateCallRequestRequestBody,
  UpdateCallRequestRequestParams,
  UpdateCallRequestResponse
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError, CreateCallRequestDto } from '@contracts'
import { callRequestService } from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class CallRequestController {
  async create(
    req: Request<any, CreateCallRequestResponse, CreateCallRequestRequest>,
    res: Response<CreateCallRequestResponse>
  ) {
    const existingCallRequest = await callRequestService.readOne(
      {
        email: req.body.email
      },
      { throwErrorIf: ActionToTakeTypes.Nothing }
    )
    if (existingCallRequest) {
      return sendSuccessResponse(res, {
        callRequest: serializeDto<CallRequest>(existingCallRequest)
      })
    }
    const payload: CreateCallRequestDto = {
      ...req.body,
      status: CallRequestStatus.Pending
    }
    const response = await callRequestService.create(payload, {
      actor: getActorData(req)
    })
    return sendSuccessResponse(res, {
      callRequest: serializeDto<CallRequest>(response)
    })
  }

  async update(
    req: Request<
      UpdateCallRequestRequestParams,
      UpdateCallRequestResponse,
      UpdateCallRequestRequestBody
    >,
    res: Response<UpdateCallRequestResponse>,
    next: NextFunction
  ) {
    const { id } = req.params
    if (!id) {
      return next(new AppError(MESSAGES.CALL_REQUESTS.MISSING_ID, 400))
    }

    await callRequestService.readOne(
      { _id: id },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    const response = await callRequestService.update({ _id: id }, req.body, {
      actor: getActorData(req)
    })

    return sendSuccessResponse(res, {
      callRequest: serializeDto<CallRequest>(response)
    })
  }

  async delete(
    req: Request<DeleteCallRequestRequestParams, DeleteCallRequestResponse>,
    res: Response<DeleteCallRequestResponse>,
    next: NextFunction
  ) {
    const { id } = req.params
    if (!id) {
      return next(new AppError(MESSAGES.CALL_REQUESTS.MISSING_ID, 400))
    }

    const response = await callRequestService.delete(
      { _id: id },
      { actor: getActorData(req) }
    )

    return sendSuccessResponse(res, {
      callRequest: serializeDto<CallRequest>(response)
    })
  }

  async getOne(
    req: Request<GetOneCallRequestRequestParams, GetOneCallRequestResponse>,
    res: Response<GetOneCallRequestResponse>
  ) {
    const callRequest = await callRequestService.readOne(
      { _id: req.params.id },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )
    return sendSuccessResponse(res, {
      callRequest: serializeDto<CallRequest>(callRequest!)
    })
  }

  async getAll(
    req: Request<any, GetAllCallRequestsResponse, any, GetAllCallRequestsQuery>,
    res: Response<GetAllCallRequestsResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const callRequests = await callRequestService.findAll(filter ?? {}, {
      limit,
      page,
      sort: sort ?? { createdAt: -1 }
    })

    return sendSuccessResponse(res, {
      items: callRequests.results.map((item) =>
        serializeDto<CallRequest>(item)
      ),
      total: callRequests.totalResults,
      limit,
      page,
      totalPages: callRequests.totalPages
    })
  }
}

export const callRequestController = new CallRequestController()
