import { PROPERTY_SAVES_ENDPOINTS, UserRole } from '@commonTypes'
import { propertySavesController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import {
  CreatePropertySaveValidation,
  DeletePropertySaveValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  PROPERTY_SAVES_ENDPOINTS.GET_BY_ID,
  asyncWrapper(propertySavesController.readOne)
)
router.get(
  PROPERTY_SAVES_ENDPOINTS.READ,
  optionalAuthMiddleware,
  asyncWrapper(propertySavesController.read)
)
router.use(
  authMiddleware,
  validateRole(UserRole.User, UserRole.Company, UserRole.Broker)
)
router.post(
  PROPERTY_SAVES_ENDPOINTS.CREATE,
  validateMiddleware(CreatePropertySaveValidation),
  asyncWrapper(propertySavesController.create)
)

router.delete(
  PROPERTY_SAVES_ENDPOINTS.DELETE,
  validateMiddleware(DeletePropertySaveValidation),
  asyncWrapper(propertySavesController.delete)
)

export default router
