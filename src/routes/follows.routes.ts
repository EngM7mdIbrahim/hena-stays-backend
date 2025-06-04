import { FOLLOWS_ENDPOINTS } from '@commonTypes'
import { followsController } from '@controllers'
import { authMiddleware, validateMiddleware } from '@middlewares'
import { FollowCreationSchema, FollowDeletionSchema } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(FOLLOWS_ENDPOINTS.READ, asyncWrapper(followsController.read))
router.get(FOLLOWS_ENDPOINTS.GET_BY_ID, asyncWrapper(followsController.readOne))
router.use(authMiddleware)
router.post(
  FOLLOWS_ENDPOINTS.CREATE,
  validateMiddleware(FollowCreationSchema),
  asyncWrapper(followsController.create)
)
router.delete(
  FOLLOWS_ENDPOINTS.DELETE,
  validateMiddleware(FollowDeletionSchema),
  asyncWrapper(followsController.delete)
)

export default router
