import {
  ActionToTakeTypes,
  GetAllSubscriptionsRequestQuery,
  GetAllSubscriptionsResponseBody,
  GetOneSubscriptionRequestParams,
  GetOneSubscriptionResponseBody,
  Subscriptions
} from '@commonTypes'
import { subscriptionsService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class SubscriptionController {
  async getSubscriptions(
    req: Request<any, any, any, GetAllSubscriptionsRequestQuery>,
    res: Response<GetAllSubscriptionsResponseBody>
  ) {
    const { page, limit, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)
    const subscriptions = await subscriptionsService.findAll(filter, {
      page,
      limit,
      sort,
      populateFields
    })
    return sendSuccessResponse(res, {
      items: subscriptions.results.map((subscription) =>
        serializeDto<Subscriptions>(subscription)
      ),
      total: subscriptions.totalResults,
      limit: subscriptions.limit,
      page: subscriptions.page,
      totalPages: subscriptions.totalPages
    })
  }

  async getSubscription(
    req: Request<GetOneSubscriptionRequestParams>,
    res: Response<GetOneSubscriptionResponseBody>
  ) {
    const { id } = req.params
    const subscription = await subscriptionsService.readOne(
      { _id: id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    return sendSuccessResponse(res, {
      subscription: serializeDto<Subscriptions>(subscription)
    })
  }

  async getMySubscription(
    req: Request,
    res: Response<GetOneSubscriptionResponseBody>
  ) {
    return sendSuccessResponse(res, {
      subscription: serializeDto<Subscriptions>(req.subscription!)
    })
  }

  async updateSubscription(req: Request, res: Response) {
    const { id } = req.params
    const { credits } = req.body
    const subscription = await subscriptionsService.update(
      { _id: id },
      { $inc: { credits } },
      { actor: getActorData(req) }
    )
    return sendSuccessResponse(res, { subscription })
  }
}

export const subscriptionController = new SubscriptionController()
