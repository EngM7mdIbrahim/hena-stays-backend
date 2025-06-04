import { notificationDeviceCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  CreateRequestBuyPropertyRequestBody,
  CreateRequestBuyPropertyResponse,
  DeleteRequestBuyPropertyRequestParams,
  DeleteRequestBuyPropertyResponse,
  GetAllRequestBuyPropertiesResponse,
  GetAllRequestBuyPropertyQuery,
  GetOneRequestBuyPropertyQuery,
  GetOneRequestBuyPropertyRequestParams,
  GetOneRequestBuyPropertyResponse,
  NotificationTitles,
  NotificationTypes,
  PropertyStatusEnum,
  RequestBuyProperty,
  UpdateRequestBuyPropertyRequestBody,
  UpdateRequestBuyPropertyRequestParams,
  UpdateRequestBuyPropertyResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { IUserDocument, PopulatedRequestBuyPropertyDocument } from '@contracts'
import { requestBuyPropertyService } from '@services'
import { Request, Response } from 'express'
import { RootFilterQuery } from 'mongoose'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class RequestBuyPropertyController {
  async createRequestBuyProperty(
    req: Request<any, any, CreateRequestBuyPropertyRequestBody>,
    res: Response<CreateRequestBuyPropertyResponse>
  ) {
    const requestBuyProperty = await requestBuyPropertyService.create(
      {
        ...req.body,
        status: PropertyStatusEnum.Active,
        createdBy: String(req.user!._id)
      },
      { actor: getActorData(req) }
    )
    notificationDeviceCombinedService.sendPushNotificationToAllUsers(
      NotificationTypes.BuyPropertyRequest,
      {
        notificationData: {
          title: NotificationTitles.BuyProperty,
          body: MESSAGES.NOTIFICATIONS.checkNew('buy property request'),
          payload: {
            _id: requestBuyProperty._id.toString(),
            createdBy: requestBuyProperty.createdBy.toString()
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
      requestBuyProperty: serializeDto<RequestBuyProperty>(requestBuyProperty)
    })
  }

  async readAllRequestBuyProperties(
    req: Request<any, any, any, GetAllRequestBuyPropertyQuery>,
    res: Response<GetAllRequestBuyPropertiesResponse>
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

    const requestBuyProperties =
      await requestBuyPropertyService.findAll<PopulatedRequestBuyPropertyDocument>(
        { ...filter },
        {
          sort,
          limit,
          page,
          populateFields
        }
      )
    return sendSuccessResponse(res, {
      items: requestBuyProperties.results.map((p) =>
        serializeDto<RequestBuyProperty>(p)
      ),
      total: requestBuyProperties.totalResults,
      limit: requestBuyProperties.limit,
      page: requestBuyProperties.page,
      totalPages: requestBuyProperties.totalPages
    })
  }

  async readOneRequestBuyProperty(
    req: Request<
      GetOneRequestBuyPropertyRequestParams,
      any,
      any,
      GetOneRequestBuyPropertyQuery
    >,
    res: Response<GetOneRequestBuyPropertyResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)

    const requestBuyProperty =
      await requestBuyPropertyService.readOne<PopulatedRequestBuyPropertyDocument>(
        { _id: req.params.id },
        {
          throwErrorIf: ActionToTakeTypes.NotFound,
          populateFields
        }
      )
    return sendSuccessResponse(res, {
      requestBuyProperty: serializeDto<RequestBuyProperty>(requestBuyProperty!)
    })
  }

  async updateRequestBuyProperty(
    req: Request<
      UpdateRequestBuyPropertyRequestParams,
      any,
      UpdateRequestBuyPropertyRequestBody
    >,
    res: Response<UpdateRequestBuyPropertyResponse>
  ) {
    const filter = filterProtection({}, req.user)
    const requestBuyProperty = await requestBuyPropertyService.update(
      { _id: req.params.id, ...filter },
      req.body,
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, {
      requestBuyProperty: serializeDto<RequestBuyProperty>(requestBuyProperty)
    })
  }

  async deleteRequestBuyProperty(
    req: Request<DeleteRequestBuyPropertyRequestParams>,
    res: Response<DeleteRequestBuyPropertyResponse>
  ) {
    const filter = filterProtection({}, req.user)
    const { reasonDelete } = req.body
    await requestBuyPropertyService.update(
      {
        _id: req.params.id,
        ...filter
      },
      {
        reasonDelete
      },
      { actor: getActorData(req) }
    )
    const requestBuyProperty = await requestBuyPropertyService.delete(
      {
        _id: req.params.id,
        ...filter
      },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(
      res,
      {
        requestBuyProperty: serializeDto<RequestBuyProperty>(requestBuyProperty)
      },
      204
    )
  }
}

function filterProtection(
  filter: RootFilterQuery<RequestBuyProperty>,
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

export const requestBuyPropertyController = new RequestBuyPropertyController()
