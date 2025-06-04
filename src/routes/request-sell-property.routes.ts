import { REQUEST_SELL_PROPERTIES_ENDPOINTS, UserRole } from '@commonTypes'
import { requestSellPropertyController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import {
  RequestSellPropertyCreationValidation,
  RequestSellPropertyUpdateValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  REQUEST_SELL_PROPERTIES_ENDPOINTS.GET_ALL,
  authMiddleware,
  asyncWrapper(requestSellPropertyController.readAllRequestSellProperties)
)

router.get(
  REQUEST_SELL_PROPERTIES_ENDPOINTS.GET_ONE,
  authMiddleware,
  asyncWrapper(requestSellPropertyController.readOneRequestSellProperty)
)

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.User))

router.post(
  REQUEST_SELL_PROPERTIES_ENDPOINTS.CREATE,
  validateMiddleware(RequestSellPropertyCreationValidation),
  asyncWrapper(requestSellPropertyController.createRequestSellProperty)
)

router.patch(
  REQUEST_SELL_PROPERTIES_ENDPOINTS.UPDATE,
  validateMiddleware(RequestSellPropertyUpdateValidation),
  asyncWrapper(requestSellPropertyController.updateRequestSellProperty)
)

router.delete(
  REQUEST_SELL_PROPERTIES_ENDPOINTS.DELETE,
  asyncWrapper(requestSellPropertyController.deleteRequestSellProperty)
)

export default router
