import { CALL_REQUEST_ENDPOINTS, UserRole } from '@commonTypes'
import { callRequestController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import {
  CallRequestCreationValidation,
  CallRequestUpdateValidation,
  DeleteCallRequestValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

// Public routes
router.post(
  CALL_REQUEST_ENDPOINTS.CREATE,
  optionalAuthMiddleware,
  validateMiddleware(CallRequestCreationValidation),
  asyncWrapper(callRequestController.create)
)

// Protected routes
router.get(
  CALL_REQUEST_ENDPOINTS.GET_ALL,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(callRequestController.getAll)
)

router.get(
  CALL_REQUEST_ENDPOINTS.GET_ONE,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(callRequestController.getOne)
)

router.patch(
  CALL_REQUEST_ENDPOINTS.UPDATE,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  validateMiddleware(CallRequestUpdateValidation),
  asyncWrapper(callRequestController.update)
)

router.delete(
  CALL_REQUEST_ENDPOINTS.DELETE,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  validateMiddleware(DeleteCallRequestValidation),
  asyncWrapper(callRequestController.delete)
)

export default router
