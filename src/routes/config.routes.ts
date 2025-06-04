import { CONFIG_ENDPOINTS, UserRole } from '@commonTypes'
import { configController } from '@controllers'
import { authMiddleware, validateRole } from '@middlewares'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(CONFIG_ENDPOINTS.GET, asyncWrapper(configController.getConfig))

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.AdminViewer))

router.patch(
  CONFIG_ENDPOINTS.UPDATE,
  asyncWrapper(configController.updateConfig)
)

export default router
