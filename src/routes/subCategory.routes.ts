import { SUB_CATEGORIES_ENDPOINTS, UserRole } from '@commonTypes'
import { subCategoryController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import {
  SubCategoryCreateValidation,
  SubCategoryUpdateValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  SUB_CATEGORIES_ENDPOINTS.GET_ALL,
  asyncWrapper(subCategoryController.getAllSubCategories)
)

router.get(
  SUB_CATEGORIES_ENDPOINTS.GET_BY_ID,
  asyncWrapper(subCategoryController.getOneSubCategory)
)

router.use(authMiddleware, validateRole(UserRole.Admin))

router.post(
  SUB_CATEGORIES_ENDPOINTS.CREATE,
  validateMiddleware(SubCategoryCreateValidation),
  asyncWrapper(subCategoryController.createSubCategory)
)

router.patch(
  SUB_CATEGORIES_ENDPOINTS.UPDATE,
  validateMiddleware(SubCategoryUpdateValidation),
  asyncWrapper(subCategoryController.updateSubCategory)
)

router.delete(
  SUB_CATEGORIES_ENDPOINTS.DELETE,
  asyncWrapper(subCategoryController.deleteSubCategory)
)

export default router
