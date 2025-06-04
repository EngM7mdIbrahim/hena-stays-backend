import { BLOGS_ENDPOINTS, UserRole } from '@commonTypes'
import { blogController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { BlogCreationValidation, BlogUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()
router.get(BLOGS_ENDPOINTS.READ, asyncWrapper(blogController.read))

router.get(BLOGS_ENDPOINTS.GET_BY_ID, asyncWrapper(blogController.readOne))

router.use(
  authMiddleware,
  validateRole(
    UserRole.Company,
    UserRole.Broker,
    UserRole.Admin,
    UserRole.Agent,
    UserRole.CompanyAdmin,
    UserRole.AdminViewer
  )
)

router.post(
  BLOGS_ENDPOINTS.CREATE,
  validateMiddleware(BlogCreationValidation),
  asyncWrapper(blogController.create)
)

router.put(
  BLOGS_ENDPOINTS.UPDATE,
  validateMiddleware(BlogUpdateValidation),
  asyncWrapper(blogController.update)
)

router.delete(BLOGS_ENDPOINTS.DELETE, asyncWrapper(blogController.delete))

export default router
