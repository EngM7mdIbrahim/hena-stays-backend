import {
  GetPaymentTransactionsRequestQuery,
  GetPaymentTransactionsResponseBody,
  PaymentCreditsCheckoutRequestBody,
  PaymentCreditsCheckoutResponseBody
} from '@commonTypes'
import { MESSAGES, PAYMENT_STATUS } from '@constants'
import { AppError } from '@contracts'
import {
  configsService,
  loggerService,
  paymentService,
  subscriptionsService,
  userService
} from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData, sendSuccessResponse } from '@utils'

class PaymentController {
  async createSessionCredits(
    req: Request<
      any,
      PaymentCreditsCheckoutResponseBody,
      PaymentCreditsCheckoutRequestBody
    >,
    res: Response<PaymentCreditsCheckoutResponseBody>,
    next: NextFunction
  ) {
    const { credits, returnUrl } = req.body
    const config = await configsService.readOne({}, {})
    if (!config) {
      return next(new AppError(MESSAGES.notFound('config'), 500))
    }
    const sessionUrl = await paymentService.createCreditsPaymentSession(
      credits,
      returnUrl,
      req.user!,
      config.creditsPrice
    )
    if (!sessionUrl) {
      return next(
        new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
      )
    }
    return sendSuccessResponse(res, { url: sessionUrl })
  }
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    const event = await paymentService.webhookSignatureVerification(req)
    if (!event) {
      loggerService.error(
        `Missing event from stripe webhook, can't process the request`
      )
      return next(
        new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
      )
    }
    req.event = event
    next()
  }

  async receiveWebhook(req: Request, res: Response, next: NextFunction) {
    const { status, invoice } = await paymentService.stripeWebhookHandler(
      req.event!
    )
    if (status === PAYMENT_STATUS.FAILED) {
      return next(new AppError('Failed', 400))
    }
    const user = await userService.readOne({
      stripeCustomerId: invoice!.customer
    })
    if (!user) {
      return next(new AppError(MESSAGES.notFound('user'), 400))
    }
    const subscription = await subscriptionsService.readOne(
      { _id: user.subscription },
      {}
    )
    if (!subscription) {
      return next(new AppError(MESSAGES.notFound('subscription'), 400))
    }
    const updatedSubscription = await subscriptionsService.update(
      {
        _id: subscription._id
      },
      {
        $inc: {
          credits: invoice?.metadata?.credits
        }
      },
      {
        actor: getActorData()
      }
    )

    return sendSuccessResponse(res, {
      message: 'Payment received successfully',
      subscription: updatedSubscription
    })
  }

  async getTransactions(
    req: Request<any, any, any, GetPaymentTransactionsRequestQuery>,
    res: Response<GetPaymentTransactionsResponseBody>
  ) {
    const {
      userId,
      status,
      starting_after,
      ending_before,
      limit: limitQuery
    } = req.query
    const limit = Number(limitQuery) || 10
    let stripeCustomerId
    if (userId) {
      const user = await userService.readOne({ _id: userId })
      if (user) {
        stripeCustomerId = user.stripeCustomerId!
      }
    }
    const { transactions, hasNext } = await paymentService.getTransactions({
      limit,
      stripeCustomerId,
      status: status,
      starting_after: starting_after as string,
      ending_before: ending_before as string
    })
    return sendSuccessResponse(res, {
      transactions,
      hasNext
    })
  }
}

export const paymentController = new PaymentController()
