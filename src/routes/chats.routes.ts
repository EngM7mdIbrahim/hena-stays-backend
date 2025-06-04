import { CHAT_ENDPOINTS } from '@commonTypes'
import { chatsController } from '@controllers'
import { authMiddleware, validateMiddleware } from '@middlewares'
import { ChatCreationValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.use(authMiddleware)
router.post(
  CHAT_ENDPOINTS.CREATE,
  validateMiddleware(ChatCreationValidation),
  asyncWrapper(chatsController.create)
)

router.get(CHAT_ENDPOINTS.READ, asyncWrapper(chatsController.readAll))

router.get(
  CHAT_ENDPOINTS.GET_MESSAGES,
  asyncWrapper(chatsController.getChatMessages)
)

export default router
