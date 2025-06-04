import { env } from '@config'
import { MESSAGES, PAYMENT_STATUS } from '@constants'
import { AppError, IUserDocument } from '@contracts'
import { Request } from 'express'
import Stripe from 'stripe'

import { loggerService } from './logger.service'

interface GetTransactionsOptions {
  limit: number
  stripeCustomerId?: string
  status?: Stripe.Checkout.Session.Status
  starting_after?: string
  ending_before?: string
}

class PaymentService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY)
  }

  async createCreditsPaymentSession(
    credits: number,
    returnUrl: string,
    user: IUserDocument,
    creditsPrice: number
  ) {
    const successUrl = `${returnUrl}?success=true`
    const cancelUrl = `${returnUrl}?success=false&credits=${credits}`

    const session = await this.stripe.checkout.sessions.create({
      customer: user.stripeCustomerId!,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: env.CURRENCY,
            product_data: {
              name: 'TrueDar Credits'
            },
            unit_amount: creditsPrice * 100
          },
          quantity: credits
        }
      ],
      automatic_tax: {
        enabled: true
      },
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        credits
      },
      saved_payment_method_options: {
        payment_method_save: 'enabled'
      },
      customer_update: {
        address: 'auto'
      }
    })

    return session.url
  }

  async getTransactions({
    limit,
    stripeCustomerId,
    status,
    starting_after,
    ending_before
  }: GetTransactionsOptions) {
    const filter: Stripe.Checkout.SessionListParams = {
      limit,
      ...(stripeCustomerId && { customer: stripeCustomerId }),
      ...(status && { status }),
      ...(starting_after && { starting_after }),
      ...(ending_before && { ending_before })
    }
    const rawTransactions = await this.stripe.checkout.sessions.list(filter)

    const transactions = rawTransactions.data.map((transaction) => {
      return {
        id: transaction.id,
        currency: transaction.currency!,
        customerDetails: transaction.customer_details!,
        creditsCost: transaction.amount_subtotal!,
        totalAmount: transaction.amount_total!,
        taxAmount: transaction.total_details?.amount_tax,
        status: transaction.status!,
        paymentStatus: transaction.payment_status!,
        createdAt: new Date(transaction.created! * 1000),
        credits: Number(transaction.metadata!.credits!)
      }
    })
    return {
      transactions,
      hasNext: rawTransactions.has_more
    }
  }

  async getCustomerId(email: string, name: string) {
    const filteredStripeCustomers = await this.stripe.customers.list({
      email
    })
    const stripeCustomer = filteredStripeCustomers.data?.[0]
    if (!stripeCustomer) {
      loggerService.error(
        `Error checking customer id from stripe with email: ${email} and name: ${name}`
      )
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
    if (filteredStripeCustomers.data.length > 0) {
      return stripeCustomer.id
    } else {
      const newCustomer = await this.stripe.customers.create({
        email,
        name
      })
      return newCustomer.id
    }
  }

  async webhookSignatureVerification(req: Request) {
    const sig = req.headers['stripe-signature']
    if (!req.rawBody) {
      loggerService.error(
        `Error verifying webhook signature as missing raw body of the request`
      )
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
    if (!sig) {
      loggerService.error(
        `Error verifying webhook signature as missing stripe-signature header`
      )
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    )
    return event
  }

  async stripeWebhookHandler(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const invoice = event.data.object
        return {
          status: PAYMENT_STATUS.SUCCESS,
          invoice
        }
      }
      default: {
        try {
          loggerService.error(
            `Unhandled stripe webhook event type: ${event.type} with data: ${JSON.stringify(
              event.data
            )}`
          )
        } catch {
          loggerService.error(
            `Error logging unhandled stripe webhook event type: ${event.type}`
          )
        }
        return {
          status: PAYMENT_STATUS.FAILED,
          invoice: null
        }
      }
    }
  }
}

export const paymentService = new PaymentService()
