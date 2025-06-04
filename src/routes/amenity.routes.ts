import { AMENITY_ENDPOINTS, UserRole } from '@commonTypes'
import { amenityController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { AmenityCreateValidation, AmenityUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(AMENITY_ENDPOINTS.GET_ALL, asyncWrapper(amenityController.getAll))

router.get(AMENITY_ENDPOINTS.GET_BY_ID, asyncWrapper(amenityController.getOne))

router.post(
  AMENITY_ENDPOINTS.CREATE,
  authMiddleware,
  validateRole(UserRole.Admin),
  validateMiddleware(AmenityCreateValidation),
  asyncWrapper(amenityController.create)
)

router.patch(
  AMENITY_ENDPOINTS.UPDATE,
  authMiddleware,
  validateRole(UserRole.Admin),
  validateMiddleware(AmenityUpdateValidation),
  asyncWrapper(amenityController.update)
)

router.delete(
  AMENITY_ENDPOINTS.DELETE,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(amenityController.delete)
)

export default router
