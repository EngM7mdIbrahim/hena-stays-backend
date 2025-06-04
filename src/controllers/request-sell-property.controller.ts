import { notificationDeviceCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  CreateRequestSellPropertyRequestBody,
  CreateRequestSellPropertyResponse,
  DeleteRequestSellPropertyRequestParams,
  DeleteRequestSellPropertyResponse,
  GetAllRequestSellPropertiesResponse,
  GetAllRequestSellPropertyQuery,
  GetOneRequestSellPropertyQuery,
  GetOneRequestSellPropertyRequestParams,
  GetOneRequestSellPropertyResponse,
  NotificationTitles,
  NotificationTypes,
  RequestSellProperty,
  UpdateRequestSellPropertyRequestBody,
  UpdateRequestSellPropertyRequestParams,
  UpdateRequestSellPropertyResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { IUserDocument, PopulatedRequestSellPropertyDocument } from '@contracts'
import { requestSellPropertyService } from '@services'
import { Request, Response } from 'express'
import { RootFilterQuery } from 'mongoose'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class RequestSellPropertyController {
  async createRequestSellProperty(
    req: Request<any, any, CreateRequestSellPropertyRequestBody>,
    res: Response<CreateRequestSellPropertyResponse>
  ) {
    const requestSellProperty = await requestSellPropertyService.create(
      {
        ...req.body,
        createdBy: String(req.user!._id)
      },
      { actor: getActorData(req) }
    )
    notificationDeviceCombinedService.sendPushNotificationToAllUsers(
      NotificationTypes.SellPropertyRequest,
      {
        notificationData: {
          title: NotificationTitles.SellProperty,
          body: MESSAGES.NOTIFICATIONS.checkNew('sell property request'),
          image: requestSellProperty.media?.[0]?.url,
          payload: {
            _id: requestSellProperty._id.toString(),
            createdBy: requestSellProperty.createdBy.toString()
          }
        },
        filters: {
          role: {
            $in: [
              UserRole.Admin,
              UserRole.AdminViewer,
              UserRole.Broker,
              UserRole.Agent,
              UserRole.Company,
              UserRole.CompanyAdmin
            ]
          }
        }
      }
    )
    return sendSuccessResponse(res, {
      requestSellProperty:
        serializeDto<RequestSellProperty>(requestSellProperty)
    })
  }

  async readAllRequestSellProperties(
    req: Request<any, any, any, GetAllRequestSellPropertyQuery>,
    res: Response<GetAllRequestSellPropertiesResponse>
  ) {
    const {
      page,
      limit,
      sort,
      filter: baseFilter
    } = getPaginationData(req.query)
    const filter = filterProtection(
      baseFilter,
      req.user,
      req.query?.mine === 'true'
    )
    const populateFields = populationBuilder(req.query.showFields)

    const requestSellProperties =
      await requestSellPropertyService.findAll<PopulatedRequestSellPropertyDocument>(
        { ...filter },
        {
          sort,
          limit,
          page,
          populateFields
        }
      )
    return sendSuccessResponse(res, {
      items: requestSellProperties.results.map((p) =>
        serializeDto<RequestSellProperty>(p)
      ),
      total: requestSellProperties.totalResults,
      limit: requestSellProperties.limit,
      page: requestSellProperties.page,
      totalPages: requestSellProperties.totalPages
    })
  }

  async readOneRequestSellProperty(
    req: Request<
      GetOneRequestSellPropertyRequestParams,
      any,
      any,
      GetOneRequestSellPropertyQuery
    >,
    res: Response<GetOneRequestSellPropertyResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)

    const requestSellProperty =
      await requestSellPropertyService.readOne<PopulatedRequestSellPropertyDocument>(
        { _id: req.params.id },
        {
          throwErrorIf: ActionToTakeTypes.NotFound,
          populateFields
        }
      )
    return sendSuccessResponse(res, {
      requestSellProperty: serializeDto<RequestSellProperty>(
        requestSellProperty!
      )
    })
  }

  async updateRequestSellProperty(
    req: Request<
      UpdateRequestSellPropertyRequestParams,
      any,
      UpdateRequestSellPropertyRequestBody
    >,
    res: Response<UpdateRequestSellPropertyResponse>
  ) {
    const filter = filterProtection({}, req.user)
    const requestSellProperty = await requestSellPropertyService.update(
      { _id: req.params.id, ...filter },
      req.body,
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      requestSellProperty:
        serializeDto<RequestSellProperty>(requestSellProperty)
    })
  }

  async deleteRequestSellProperty(
    req: Request<DeleteRequestSellPropertyRequestParams>,
    res: Response<DeleteRequestSellPropertyResponse>
  ) {
    const filter = filterProtection({}, req.user)
    const requestSellProperty = await requestSellPropertyService.delete(
      {
        _id: req.params.id,
        ...filter
      },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      requestSellProperty:
        serializeDto<RequestSellProperty>(requestSellProperty)
    })
  }
}

function filterProtection(
  filter: RootFilterQuery<RequestSellProperty>,
  user?: IUserDocument,
  isMineRequested: boolean = false
) {
  if (user?.role === UserRole.User || isMineRequested) {
    return {
      ...filter,
      createdBy: user?._id
    }
  }
  return filter
}

export const requestSellPropertyController = new RequestSellPropertyController()
