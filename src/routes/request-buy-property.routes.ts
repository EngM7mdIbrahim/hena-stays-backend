import { REQUEST_BUY_PROPERTIES_ENDPOINTS, UserRole } from '@commonTypes'
import { requestBuyPropertyController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import {
  DeleteRequestBuyPropertyValidation,
  RequestBuyPropertyCreationValidation,
  RequestBuyPropertyUpdateValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  REQUEST_BUY_PROPERTIES_ENDPOINTS.GET_ALL,
  authMiddleware,
  asyncWrapper(requestBuyPropertyController.readAllRequestBuyProperties)
)

router.get(
  REQUEST_BUY_PROPERTIES_ENDPOINTS.GET_ONE,
  authMiddleware,
  asyncWrapper(requestBuyPropertyController.readOneRequestBuyProperty)
)

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.User))

router.post(
  REQUEST_BUY_PROPERTIES_ENDPOINTS.CREATE,
  validateMiddleware(RequestBuyPropertyCreationValidation),
  asyncWrapper(requestBuyPropertyController.createRequestBuyProperty)
)

router.patch(
  REQUEST_BUY_PROPERTIES_ENDPOINTS.UPDATE,
  validateMiddleware(RequestBuyPropertyUpdateValidation),
  asyncWrapper(requestBuyPropertyController.updateRequestBuyProperty)
)

router.delete(
  REQUEST_BUY_PROPERTIES_ENDPOINTS.DELETE,
  validateMiddleware(DeleteRequestBuyPropertyValidation),
  asyncWrapper(requestBuyPropertyController.deleteRequestBuyProperty)
)

export default router
