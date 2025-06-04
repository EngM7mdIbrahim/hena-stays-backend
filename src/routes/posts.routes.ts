import { POSTS_ENDPOINTS, UserRole } from '@commonTypes'
import { postController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  postImpressionsInterceptor,
  userViewPostInteractionsCounterMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import { PostCreationValidation, PostUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()
router.get(
  POSTS_ENDPOINTS.READ,
  optionalAuthMiddleware,
  asyncWrapper(postController.read),
  postImpressionsInterceptor
)
router.get(
  POSTS_ENDPOINTS.GET_BY_ID,
  optionalAuthMiddleware,
  userViewPostInteractionsCounterMiddleware,
  asyncWrapper(postController.readOne)
)
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
  POSTS_ENDPOINTS.CREATE,
  validateMiddleware(PostCreationValidation),
  asyncWrapper(postController.create)
)
router.put(
  POSTS_ENDPOINTS.UPDATE,
  validateMiddleware(PostUpdateValidation),
  asyncWrapper(postController.update)
)
router.delete(POSTS_ENDPOINTS.DELETE, asyncWrapper(postController.delete))

export default router
