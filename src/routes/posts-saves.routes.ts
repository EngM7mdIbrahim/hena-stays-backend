import { POSTS_SAVES_ENDPOINTS } from '@commonTypes'
import { postsSavesController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateMiddleware
} from '@middlewares'
import { CreatePostSaveValidation, DeletePostSaveValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  POSTS_SAVES_ENDPOINTS.GET_BY_ID,
  asyncWrapper(postsSavesController.readOne)
)
router.get(
  POSTS_SAVES_ENDPOINTS.READ,
  optionalAuthMiddleware,
  asyncWrapper(postsSavesController.read)
)
router.use(authMiddleware)
router.post(
  POSTS_SAVES_ENDPOINTS.CREATE,
  validateMiddleware(CreatePostSaveValidation),
  asyncWrapper(postsSavesController.create)
)

router.delete(
  POSTS_SAVES_ENDPOINTS.DELETE,
  validateMiddleware(DeletePostSaveValidation),
  asyncWrapper(postsSavesController.delete)
)

export default router
