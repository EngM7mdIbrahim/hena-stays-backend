import { INTERACTIONS_ENDPOINTS } from '@commonTypes'
import { interactionController } from '@controllers'
import { authMiddleware } from '@middlewares'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  INTERACTIONS_ENDPOINTS.GET_ALL,
  authMiddleware,
  asyncWrapper(interactionController.getAllInteractions)
)

router.get(
  INTERACTIONS_ENDPOINTS.GET_ONE,
  authMiddleware,
  asyncWrapper(interactionController.getOneInteractions)
)

export default router
