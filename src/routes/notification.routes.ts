import { NOTIFICATIONS_ENDPOINTS } from '@commonTypes'
import { notificationsController } from '@controllers'
import { authMiddleware } from '@middlewares'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  NOTIFICATIONS_ENDPOINTS.GET_ALL,
  authMiddleware,
  asyncWrapper(notificationsController.getAll)
)

router.get(
  NOTIFICATIONS_ENDPOINTS.COUNT_UNREAD,
  authMiddleware,
  asyncWrapper(notificationsController.countUnread)
)

router.get(
  NOTIFICATIONS_ENDPOINTS.GET_ONE,
  authMiddleware,
  asyncWrapper(notificationsController.getOne)
)

router.delete(
  NOTIFICATIONS_ENDPOINTS.DELETE_ONE,
  authMiddleware,
  asyncWrapper(notificationsController.deleteNotification)
)

router.delete(
  NOTIFICATIONS_ENDPOINTS.DELETE_ALL,
  authMiddleware,
  asyncWrapper(notificationsController.deleteAll)
)

export default router
