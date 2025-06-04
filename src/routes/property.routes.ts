import { PROPERTY_ENDPOINTS, UserRole } from '@commonTypes'
import { propertyController } from '@controllers'
import {
  authMiddleware,
  createSessionMiddleware,
  interactionsCounterMiddleware,
  optionalAuthMiddleware,
  propertyImpressionsInterceptor,
  validateMiddleware,
  validateRole
} from '@middlewares'
import {
  DeletePropertyValidation,
  PropertyBulkRecommendUpdateSchema,
  PropertyCreationValidation,
  PropertyUpdateValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  PROPERTY_ENDPOINTS.GET_ALL,
  optionalAuthMiddleware,
  asyncWrapper(propertyController.readAllProperty),
  propertyImpressionsInterceptor
)

router.get(
  PROPERTY_ENDPOINTS.GET_ONE,
  optionalAuthMiddleware,
  interactionsCounterMiddleware,
  asyncWrapper(propertyController.readOneProperty)
)

router.get(
  PROPERTY_ENDPOINTS.GET_NEAREST,
  optionalAuthMiddleware,
  asyncWrapper(propertyController.getPropertiesNearMe),
  propertyImpressionsInterceptor
)

router.use(
  authMiddleware,
  validateRole(
    UserRole.Company,
    UserRole.Broker,
    UserRole.Admin,
    UserRole.Agent,
    UserRole.CompanyAdmin
  )
)

router.post(
  PROPERTY_ENDPOINTS.CREATE,
  validateMiddleware(PropertyCreationValidation),
  asyncWrapper(propertyController.createProperty)
)
router.patch(
  PROPERTY_ENDPOINTS.BULK_UPDATE_RECOMMENDATION,
  createSessionMiddleware,
  validateMiddleware(PropertyBulkRecommendUpdateSchema),
  asyncWrapper(propertyController.bulkUpdatePropertiesRecommendation)
)

router.patch(
  PROPERTY_ENDPOINTS.UPDATE,
  validateMiddleware(PropertyUpdateValidation),
  asyncWrapper(propertyController.updateProperty)
)

router.delete(
  PROPERTY_ENDPOINTS.DELETE,
  validateMiddleware(DeletePropertyValidation),
  asyncWrapper(propertyController.deleteProperty)
)

export default router
