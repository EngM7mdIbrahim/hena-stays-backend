import { CREDITS_REQUESTS_ENDPOINTS, UserRole } from '@commonTypes'
import { creditsRequestsController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { CreateCreditsRequestSchema } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.post(
  CREDITS_REQUESTS_ENDPOINTS.CREATE,
  authMiddleware,
  validateRole(UserRole.Broker, UserRole.Company),
  validateMiddleware(CreateCreditsRequestSchema),
  asyncWrapper(creditsRequestsController.createRequest)
)

router.get(
  CREDITS_REQUESTS_ENDPOINTS.GET_ALL,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(creditsRequestsController.getAllRequests)
)

router.get(
  CREDITS_REQUESTS_ENDPOINTS.GET_ONE,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(creditsRequestsController.getRequest)
)

router.patch(
  CREDITS_REQUESTS_ENDPOINTS.UPDATE_STATUS,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(creditsRequestsController.updateRequestStatus)
)

export default router
