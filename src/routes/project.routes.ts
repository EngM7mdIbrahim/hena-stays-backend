import { PROJECT_ENDPOINTS, UserRole } from '@commonTypes'
import { projectController } from '@controllers'
import {
  authMiddleware,
  createSessionMiddleware,
  optionalAuthMiddleware,
  projectImpressionsInterceptor,
  userViewProjectInteractionsCounterMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import { ProjectCreationValidation, ProjectUpdateValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  PROJECT_ENDPOINTS.GET_ALL,
  optionalAuthMiddleware,
  asyncWrapper(projectController.read),
  projectImpressionsInterceptor
)

router.get(
  PROJECT_ENDPOINTS.GET_ONE,
  optionalAuthMiddleware,
  userViewProjectInteractionsCounterMiddleware,
  asyncWrapper(projectController.readOne)
)

router.use(
  authMiddleware,
  validateRole(
    UserRole.Company,
    UserRole.Broker,
    UserRole.Admin,
    UserRole.Agent,
    UserRole.CompanyAdmin
  )
)

router.post(
  PROJECT_ENDPOINTS.CREATE,
  validateMiddleware(ProjectCreationValidation),
  asyncWrapper(projectController.create)
)

router.patch(
  PROJECT_ENDPOINTS.UPDATE,
  validateMiddleware(ProjectUpdateValidation, true),
  asyncWrapper(projectController.update)
)

router.delete(
  PROJECT_ENDPOINTS.DELETE,
  createSessionMiddleware,
  asyncWrapper(projectController.delete)
)

export default router
