import { LIKES_ENDPOINTS } from '@commonTypes'
import { likeController } from '@controllers'
import { authMiddleware, validateMiddleware } from '@middlewares'
import { DeleteLikeValidation, likeCreationValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()
router.get(LIKES_ENDPOINTS.READ, asyncWrapper(likeController.read))
router.get(LIKES_ENDPOINTS.GET_BY_ID, asyncWrapper(likeController.readOne))
router.use(authMiddleware)
router.post(
  LIKES_ENDPOINTS.CREATE,
  validateMiddleware(likeCreationValidation),
  asyncWrapper(likeController.create)
)

router.delete(
  LIKES_ENDPOINTS.DELETE,
  validateMiddleware(DeleteLikeValidation),
  asyncWrapper(likeController.delete)
)

export default router
