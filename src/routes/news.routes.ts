import { NEWS_ENDPOINTS } from '@commonTypes'
import { newsController } from '@controllers'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(NEWS_ENDPOINTS.GET_ALL, asyncWrapper(newsController.getAll))
router.get(NEWS_ENDPOINTS.GET_ONE, asyncWrapper(newsController.getOne))

export default router
