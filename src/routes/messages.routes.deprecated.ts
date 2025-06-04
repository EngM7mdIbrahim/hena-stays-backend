import { MESSAGE_ENDPOINTS, UserRole } from '@commonTypes'
import { messageController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { MessageCreationSchemaValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()
router.use(
  authMiddleware,
  validateRole(UserRole.User, UserRole.Company, UserRole.Broker)
)
router.post(
  MESSAGE_ENDPOINTS.CREATE,
  validateMiddleware(MessageCreationSchemaValidation),
  asyncWrapper(messageController.create)
)

router.delete(
  MESSAGE_ENDPOINTS.DELETE,
  asyncWrapper(messageController.deleteMessage)
)
