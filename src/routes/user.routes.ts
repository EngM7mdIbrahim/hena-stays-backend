import { USER_ENDPOINTS, UserRole } from '@commonTypes'
import { userController } from '@controllers'
import {
  authMiddleware,
  optionalAuthMiddleware,
  userViewUserInteractionsCounterMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import { UserCompanyCreationValidation } from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  USER_ENDPOINTS.GET_DEFAULT_SUPPORT_USER,
  asyncWrapper(userController.getDefaultSupportUser)
)

router.get(
  USER_ENDPOINTS.GET_ME,
  authMiddleware,
  asyncWrapper(userController.getMe)
)

router.get(
  USER_ENDPOINTS.GET_ALL_AS_ADMIN,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(userController.getAllAsAdmin)
)

router.get(
  USER_ENDPOINTS.GET_ONE,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(userController.getOne)
)

router.get(
  USER_ENDPOINTS.GET_USERS_AS_COMPANY,
  authMiddleware,
  validateRole(UserRole.Company, UserRole.CompanyAdmin),
  asyncWrapper(userController.readAllAsCompany)
)

router.get(
  USER_ENDPOINTS.GET_ONE_AS_COMPANY,
  authMiddleware,
  validateRole(UserRole.Company, UserRole.CompanyAdmin),
  asyncWrapper(userController.getOneAsCompany)
)

router.post(
  USER_ENDPOINTS.CREATE_AS_ADMIN,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(userController.createAsAdmin)
)

router.get(
  USER_ENDPOINTS.GET_ALL_COMMUNITY,
  asyncWrapper(userController.getCommunityUsers)
)

router.get(
  USER_ENDPOINTS.GET_ONE_COMMUNITY,
  optionalAuthMiddleware,
  userViewUserInteractionsCounterMiddleware,
  asyncWrapper(userController.getOneUserCommunity)
)

router.post(
  USER_ENDPOINTS.CREATE_AS_COMPANY,
  authMiddleware,
  validateRole(UserRole.Company, UserRole.CompanyAdmin),
  validateMiddleware(UserCompanyCreationValidation),
  asyncWrapper(userController.createAsCompany)
)

router.patch(
  USER_ENDPOINTS.UPDATE_ME,
  authMiddleware,
  asyncWrapper(userController.updateMe)
)

router.patch(
  USER_ENDPOINTS.UPDATE_USER_AS_COMPANY,
  authMiddleware,
  validateRole(UserRole.Company, UserRole.CompanyAdmin),
  asyncWrapper(userController.updateUserAsCompany)
)

router.patch(
  USER_ENDPOINTS.UPDATE_USER_AS_ADMIN,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(userController.updateUserAsAdmin)
)

router.delete(
  USER_ENDPOINTS.DELETE_AS_ADMIN,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(userController.deleteUser)
)

router.delete(
  USER_ENDPOINTS.DELETE_AS_COMPANY,
  authMiddleware,
  validateRole(UserRole.Company, UserRole.CompanyAdmin),
  asyncWrapper(userController.deleteAsCompany)
)

router.delete(
  USER_ENDPOINTS.DELETE_ME,
  authMiddleware,
  asyncWrapper(userController.deleteMe)
)

router.get(
  USER_ENDPOINTS.GET_TOP_PERFORMERS,
  // authMiddleware,
  asyncWrapper(userController.getTopPerformers)
)

export default router
