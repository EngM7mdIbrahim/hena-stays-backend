import { ANALYTICS_ENDPOINTS, UserRole } from '@commonTypes'
import { analyticsController } from '@controllers'
import { authMiddleware, validateRole } from '@middlewares'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  ANALYTICS_ENDPOINTS.GET_PROPERTIES,
  authMiddleware,
  validateRole(
    UserRole.Admin,
    UserRole.Company,
    UserRole.CompanyAdmin,
    UserRole.Broker,
    UserRole.Agent
  ),
  asyncWrapper(analyticsController.propertiesAnalytics)
)
router.get(
  ANALYTICS_ENDPOINTS.GET_USERS,
  authMiddleware,
  validateRole(UserRole.Admin, UserRole.Company, UserRole.CompanyAdmin),
  asyncWrapper(analyticsController.userAnalytics)
)

router.get(
  ANALYTICS_ENDPOINTS.GET_LATEST_COMMENTS,
  authMiddleware,
  validateRole(
    UserRole.Admin,
    UserRole.Company,
    UserRole.CompanyAdmin,
    UserRole.Broker,
    UserRole.Agent
  ),
  asyncWrapper(analyticsController.latestComments)
)

router.get(
  ANALYTICS_ENDPOINTS.GET_COMMUNITY,
  authMiddleware,
  validateRole(
    UserRole.Admin,
    UserRole.Company,
    UserRole.CompanyAdmin,
    UserRole.Broker,
    UserRole.Agent
  ),
  asyncWrapper(analyticsController.communityInteractions)
)
export default router
