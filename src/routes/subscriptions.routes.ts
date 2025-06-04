import { SUBSCRIPTION_ENDPOINTS, UserRole } from '@commonTypes'
import { subscriptionController } from '@controllers'
import {
  authMiddleware,
  subscriptionExtractor,
  validateMiddleware,
  validateRole
} from '@middlewares'
import { updateSubscriptionSchema } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.use(authMiddleware)

router.get(
  SUBSCRIPTION_ENDPOINTS.GET_ALL,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(subscriptionController.getSubscriptions)
)

router.get(
  SUBSCRIPTION_ENDPOINTS.GET_ONE,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(subscriptionController.getSubscription)
)

router.get(
  SUBSCRIPTION_ENDPOINTS.GET_MINE,
  subscriptionExtractor,
  asyncWrapper(subscriptionController.getMySubscription)
)

router.patch(
  SUBSCRIPTION_ENDPOINTS.UPDATE,
  validateRole(UserRole.Admin),
  validateMiddleware(updateSubscriptionSchema),
  asyncWrapper(subscriptionController.updateSubscription)
)

export default router
