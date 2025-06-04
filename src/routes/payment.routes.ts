import { PAYMENT_ENDPOINTS, UserRole } from '@commonTypes'
import { paymentController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { createSessionCreditsSchema, getTransactionsSchema } from '@schema'
import express, { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.post(
  PAYMENT_ENDPOINTS.WEBHOOK,
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook,
  asyncWrapper(paymentController.receiveWebhook)
)

router.post(
  PAYMENT_ENDPOINTS.CREATE_SESSION_CREDITS,
  authMiddleware,
  validateRole(UserRole.Broker, UserRole.Company),
  validateMiddleware(createSessionCreditsSchema),
  asyncWrapper(paymentController.createSessionCredits)
)

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.AdminViewer))
router.get(
  PAYMENT_ENDPOINTS.GET,
  validateMiddleware(getTransactionsSchema),
  asyncWrapper(paymentController.getTransactions)
)

export default router
