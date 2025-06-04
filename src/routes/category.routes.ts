import { CATEGORIES_ENDPOINTS, UserRole } from '@commonTypes'
import { categoryController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { CategoryCreateValidation, CategoryUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  CATEGORIES_ENDPOINTS.GET_ALL,
  asyncWrapper(categoryController.getAll)
)

router.get(
  CATEGORIES_ENDPOINTS.GET_BY_ID,
  asyncWrapper(categoryController.getOne)
)

router.post(
  CATEGORIES_ENDPOINTS.CREATE,
  authMiddleware,
  validateRole(UserRole.Admin),
  validateMiddleware(CategoryCreateValidation),
  asyncWrapper(categoryController.create)
)

router.patch(
  CATEGORIES_ENDPOINTS.UPDATE,
  authMiddleware,
  validateRole(UserRole.Admin),
  validateMiddleware(CategoryUpdateValidation),
  asyncWrapper(categoryController.update)
)

router.delete(
  CATEGORIES_ENDPOINTS.DELETE,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(categoryController.delete)
)

export default router
