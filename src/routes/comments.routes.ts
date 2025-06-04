import { COMMENTS_ENDPOINTS } from '@commonTypes'
import { commentController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateMiddleware
} from '@middlewares'
import { CommentCreationValidation, CommentUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  COMMENTS_ENDPOINTS.GET_BY_ID,
  asyncWrapper(commentController.readOne)
)
router.get(
  COMMENTS_ENDPOINTS.READ,
  optionalAuthMiddleware,
  asyncWrapper(commentController.read)
)
router.use(authMiddleware)
router.post(
  COMMENTS_ENDPOINTS.CREATE,
  validateMiddleware(CommentCreationValidation),
  asyncWrapper(commentController.create)
)
router.put(
  COMMENTS_ENDPOINTS.UPDATE,
  validateMiddleware(CommentUpdateValidation),
  asyncWrapper(commentController.update)
)
router.delete(COMMENTS_ENDPOINTS.DELETE, asyncWrapper(commentController.delete))

export default router
