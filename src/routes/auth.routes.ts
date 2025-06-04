import { AUTHENTICATION_ENDPOINTS, UserRole } from '@commonTypes'
import { authController } from '@controllers'
import {
  authMiddleware,
  createSessionMiddleware,
  validateMiddleware,
  validateRole
} from '@middlewares'
import {
  ForgetPasswordValidation,
  QuickGuestRegister,
  ResetPasswordValidation,
  SendOTPValidation,
  UserRegisterValidation,
  VerifyOTPValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.post(
  AUTHENTICATION_ENDPOINTS.REGISTER,
  createSessionMiddleware,
  validateMiddleware(UserRegisterValidation), // I moved this out because this one is generaic on all cases
  asyncWrapper(authController.registerHandler)
)
router.post(
  AUTHENTICATION_ENDPOINTS.LOGIN,
  asyncWrapper(authController.loginHandler)
)
router.post(
  AUTHENTICATION_ENDPOINTS.SEND_OTP,
  validateMiddleware(SendOTPValidation),
  asyncWrapper(authController.sendOtpHandler)
)
router.post(
  AUTHENTICATION_ENDPOINTS.VERIFY_OTP,
  validateMiddleware(VerifyOTPValidation),
  asyncWrapper(authController.verifyOTPHandler)
)

router.post(
  AUTHENTICATION_ENDPOINTS.FORGET_PASSWORD,
  validateMiddleware(ForgetPasswordValidation),
  asyncWrapper(authController.forgetPasswordHandler)
)
router.post(
  AUTHENTICATION_ENDPOINTS.RESET_PASSWORD,
  validateMiddleware(ResetPasswordValidation),
  asyncWrapper(authController.resetPasswordHandler)
)
router.post(
  AUTHENTICATION_ENDPOINTS.QUICK_GUEST_REGISTER,
  validateMiddleware(QuickGuestRegister),
  asyncWrapper(authController.guestQuickRegister)
)

router.post(
  AUTHENTICATION_ENDPOINTS.LOGOUT,
  authMiddleware,
  asyncWrapper(authController.logoutHandler)
)

router.post(
  AUTHENTICATION_ENDPOINTS.LOG_IN_AS,
  authMiddleware,
  validateRole(UserRole.Admin),
  asyncWrapper(authController.adminLoginAs)
)

export default router
