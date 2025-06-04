import { CONTRACT_US_ENDPOINTS, UserRole } from '@commonTypes'
import { contactUsController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { CreateContactUsSchema } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.post(
  CONTRACT_US_ENDPOINTS.CREATE,
  validateMiddleware(CreateContactUsSchema),
  asyncWrapper(contactUsController.create)
)

router.use(authMiddleware, validateRole(UserRole.Admin, UserRole.AdminViewer))

router.delete(
  CONTRACT_US_ENDPOINTS.DELETE,

  asyncWrapper(contactUsController.delete)
)

router.get(
  CONTRACT_US_ENDPOINTS.GET_ALL,
  asyncWrapper(contactUsController.getAll)
)

router.get(
  CONTRACT_US_ENDPOINTS.GET_BY_ID,
  asyncWrapper(contactUsController.getOne)
)

export default router
