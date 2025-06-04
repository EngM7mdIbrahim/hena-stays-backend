import { SCHEDULER_ENDPOINTS } from '@commonTypes'
import { schedulerController } from '@controllers'
import { verifyScheduler } from '@middlewares'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  SCHEDULER_ENDPOINTS.DAILY,
  verifyScheduler,
  asyncWrapper(schedulerController.dailyScheduler)
)

export default router
