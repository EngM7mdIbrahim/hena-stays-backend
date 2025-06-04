import { LEADS_ENDPOINTS, UserRole } from '@commonTypes'
import { leadController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import { CreateLeadValidation, UpdateLeadValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  LEADS_ENDPOINTS.GET_ALL,
  authMiddleware,
  asyncWrapper(leadController.getAll)
)

router.get(
  LEADS_ENDPOINTS.GET_ONE,
  authMiddleware,
  asyncWrapper(leadController.getOne)
)

router.post(
  LEADS_ENDPOINTS.CREATE,
  validateMiddleware(CreateLeadValidation),
  asyncWrapper(leadController.create)
)
router.use(authMiddleware, validateRole(UserRole.Admin))

router.patch(
  LEADS_ENDPOINTS.UPDATE,
  validateMiddleware(UpdateLeadValidation),
  asyncWrapper(leadController.updateOne)
)

router.delete(LEADS_ENDPOINTS.DELETE, asyncWrapper(leadController.deleteOne))

export default router
