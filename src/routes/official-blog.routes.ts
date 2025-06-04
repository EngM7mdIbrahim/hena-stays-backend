import { OFFICIAL_BLOGS_ENDPOINTS, UserRole } from '@commonTypes'
import { officialBlogController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import {
  CreateOfficialBlogValidation,
  UpdateOfficialBlogValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  OFFICIAL_BLOGS_ENDPOINTS.GET_BY_SLUG,
  optionalAuthMiddleware,
  asyncWrapper(officialBlogController.readBySlug)
)

router.get(
  OFFICIAL_BLOGS_ENDPOINTS.READ,
  optionalAuthMiddleware,
  asyncWrapper(officialBlogController.read)
)

router.get(
  OFFICIAL_BLOGS_ENDPOINTS.GET_BY_ID,
  optionalAuthMiddleware,
  asyncWrapper(officialBlogController.readOne)
)

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.AdminViewer))
router.post(
  OFFICIAL_BLOGS_ENDPOINTS.CREATE,
  validateMiddleware(CreateOfficialBlogValidation),
  asyncWrapper(officialBlogController.create)
)

router.patch(
  OFFICIAL_BLOGS_ENDPOINTS.UPDATE,
  validateMiddleware(UpdateOfficialBlogValidation),
  asyncWrapper(officialBlogController.update)
)

router.delete(
  OFFICIAL_BLOGS_ENDPOINTS.DELETE,
  asyncWrapper(officialBlogController.delete)
)

export default router
