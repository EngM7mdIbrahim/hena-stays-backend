import { env } from 'process'
import {
  Broker,
  Company,
  Device,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoggedInModes,
  LoginAsRequest,
  LoginAsResponse,
  LoginRequest,
  LoginResponse /* RegisterUserResponse,*/,
  LogoutRequestBody,
  LogoutResponse,
  QuickGuestRegisterRequest,
  QuickGuestRegisterResponse,
  RegisterRequest,
  RegisterUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendOTPRequest,
  SendOTPResponse,
  User,
  UserRole,
  UserStatus,
  VerifyOTPRequest,
  VerifyOTPResponse
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { BrokerRegisterValidation, CompanyRegisterValidation } from '@schema'
import {
  authService,
  brokerService,
  companyService,
  deviceService,
  emailService,
  loggerService,
  otpService,
  paymentService,
  subscriptionsService,
  userService
} from '@services'
import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import {
  getActorData,
  getPreferredUriScheme,
  passwordGenerator,
  sendSuccessResponse,
  serializeDto,
  validateSchema
} from '@utils'

const handleDeviceRegister = async (
  user: User,
  fcmToken?: string,
  device?: Device['device']
) => {
  if (fcmToken && device) {
    const checkIfExist = await deviceService.readOne({
      user: user._id.toString(),
      fcmToken
    })
    if (!checkIfExist) {
      await deviceService.create(
        {
          user: user._id.toString(),
          fcmToken,
          device
        },
        {
          actor: getActorData()
        }
      )
    }
  }
}

class AuthController {
  async registerHandler(
    req: Request<any, any, RegisterRequest>,
    res: Response<RegisterUserResponse>,
    next: NextFunction
  ) {
    let response
    if (!req.dbSession) {
      loggerService.error("Session doesn't exist in register handler")
      return next(
        new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
      )
    }
    const session = req.dbSession
    switch (req.body.role) {
      case UserRole.User:
        response = await authService.userRegister(req.body, session)
        break

      case UserRole.Broker: {
        await validateSchema(BrokerRegisterValidation, req.body)
        const { city, licenseCopies, licenseExpiryDate, license, watermark } =
          req.body
        const broker = await brokerService.create(
          {
            city,
            licenseCopies,
            licenseExpiryDate,
            license,
            watermark
          },
          { session, actor: getActorData() }
        )
        const user = await authService.brokerRegister(
          {
            ...req.body,
            chatMeta: {
              online: false,
              typing: false
            },
            broker: broker._id.toString()
          },
          session
        )
        const stripeCustomerId = await paymentService.getCustomerId(
          user.email,
          user.name
        )
        user.stripeCustomerId = stripeCustomerId
        const subscription = await subscriptionsService.create(
          {
            user: user._id.toString(),
            credits: 0
          },
          {
            actor: getActorData(),
            session
          }
        )
        user.subscription = subscription._id.toString() as any
        await user.save({ session })
        response = { user, broker }
        break
      }
      case UserRole.Company: {
        await validateSchema(CompanyRegisterValidation, req.body)
        const {
          companyName,
          authority,
          city,
          jurisdiction,
          address,
          licenseCopies,
          licenseExpiryDate,
          license,
          watermark
        } = req.body
        const company = await companyService.create(
          {
            name: companyName,
            authority,
            city,
            jurisdiction,
            address,
            licenseCopies,
            licenseExpiryDate,
            license,
            watermark
          },
          { session, actor: getActorData() }
        )
        const user = await authService.companyRegister(
          {
            ...req.body,
            chatMeta: {
              online: false,
              typing: false
            },
            company: company._id.toString()
          },
          session
        )

        const finalCompany = await companyService.update(
          { _id: company._id },
          {
            owner: user._id
          },
          { session, actor: getActorData() }
        )

        const stripeCustomerId = await paymentService.getCustomerId(
          user.email,
          user.name
        )
        user.stripeCustomerId = stripeCustomerId
        const subscription = await subscriptionsService.create(
          {
            user: user._id.toString(),
            credits: 0
          },
          {
            actor: getActorData(),
            session
          }
        )
        user.subscription = subscription._id.toString() as any
        await user.save({ session })

        response = { company: finalCompany, user }

        break
      }
      default:
        return next(new AppError(MESSAGES.AUTH.INVALID_ROLE, 400))
    }
    return await sendSuccessResponse(
      res,
      {
        user: response?.user as User,
        company: response?.company ? (response?.company as Company) : null,
        broker: response?.broker ? (response?.broker as Broker) : null
      },
      201,
      req
    )
  }

  async loginHandler(
    req: Request<any, any, LoginRequest>,
    res: Response<LoginResponse>
  ) {
    const { email, password, fcmToken, device } = req.body
    const data = await authService.login({ email, password })
    const { user } = data
    if (user.role === UserRole.Company || user.role === UserRole.Broker) {
      if (!user.stripeCustomerId) {
        const stripeCustomerId = await paymentService.getCustomerId(
          user.email,
          user.name
        )
        user.stripeCustomerId = stripeCustomerId
        await user.save()
      }
      if (!user.subscription) {
        const subscription = await subscriptionsService.create(
          {
            user: user._id.toString(),
            credits: 0
          },
          {
            actor: getActorData()
          }
        )
        user.subscription = subscription
        await user.save()
        if (user.role === UserRole.Company) {
          const users = await userService.findAll({ company: user.company })
          await Promise.all(
            users.results.map((u) => {
              u.subscription = subscription._id.toString() as any
              return u.save()
            })
          )
        }
      }
    }
    const userSerialized = serializeDto<User>(user)
    await handleDeviceRegister(userSerialized, fcmToken, device)
    return await sendSuccessResponse(res, {
      user: userSerialized,
      token: data.token
    })
  }

  async sendOtpHandler(
    req: Request<any, any, SendOTPRequest>,
    res: Response<SendOTPResponse>,
    next: NextFunction
  ) {
    const { email } = req.body
    const user = await userService.readOne({ email: email.toLowerCase() })
    if (!user) {
      return next(new AppError(MESSAGES.notFound('user'), 404))
    }
    if (user.status === UserStatus.Active) {
      return next(new AppError(MESSAGES.AUTH.ALREADY_VERIFIED, 400))
    }
    const otp = otpService.generateOtp()
    user.otp = otp.toString()
    user.otpExpires = new Date(
      Date.now() + Number(env.OTP_EXPIRES_IN) * 60 * 1000
    ) // valid for 5 minutes
    await user.save()
    // send email
    await emailService.sendOTPEmail(user.email, otp.toString(), '5 minutes')

    return await sendSuccessResponse(res, { msg: MESSAGES.AUTH.OTP_SENT })
  }

  async verifyOTPHandler(
    req: Request<any, any, VerifyOTPRequest>,
    res: Response<VerifyOTPResponse>,
    next: NextFunction
  ) {
    const { email, otp, fcmToken, device } = req.body
    const user = await userService.readOne({ email: email.toLowerCase() })
    if (!user) {
      return next(new AppError(MESSAGES.notFound('user'), 404))
    }
    if (user.status === UserStatus.Active) {
      return next(new AppError(MESSAGES.AUTH.ALREADY_VERIFIED, 400))
    }
    if (user.otp !== otp) {
      return next(new AppError(MESSAGES.AUTH.INVALID_OTP, 400))
    }
    if ((user.otpExpires as Date)?.getTime() < Date.now()) {
      return next(new AppError(MESSAGES.AUTH.OTP_EXPIRED, 400))
    }
    await authService.activateUser(user)
    const token = authService.createToken({
      id: user._id.toString(),
      mode: LoggedInModes.USER
    })
    await handleDeviceRegister(serializeDto<User>(user), fcmToken, device)
    return await sendSuccessResponse(res, {
      token,
      msg: MESSAGES.AUTH.OTP_VERIFIED
    })
  }

  async forgetPasswordHandler(
    req: Request<any, any, ForgetPasswordRequest>,
    res: Response<ForgetPasswordResponse>,
    next: NextFunction
  ) {
    const { email } = req.body
    const user = await userService.readOne({ email: email.toLowerCase() })
    if (!user) {
      return next(new AppError(MESSAGES.notFound('user'), 404))
    }
    if (user.status === UserStatus.Pending) {
      return next(new AppError(MESSAGES.AUTH.NOT_VERIFIED, 400))
    }
    const resetToken = await authService.forgetPassword(user.email)

    // send email

    const resetLink = `${getPreferredUriScheme(env.CLIENT_DOMAIN ?? '')}://${env.CLIENT_DOMAIN}/reset-password?token=${resetToken}`
    await emailService.sendForgetPasswordEmail(
      user.email,
      resetLink,
      '5 minutes'
    )
    return await sendSuccessResponse(res, {
      msg: MESSAGES.AUTH.RESET_LINK_SENT
    })
  }

  async resetPasswordHandler(
    req: Request<any, any, ResetPasswordRequest>,
    res: Response<ResetPasswordResponse>,
    next: NextFunction
  ) {
    const { password, token, confirmPassword } = req.body
    const tokenData = await authService.verifyForgetPasswordToken(token)
    if (!tokenData) {
      return next(new AppError(MESSAGES.AUTH.INVALID_TOKEN, 400))
    }
    if (moment(tokenData.expiresIn).toDate().getTime() < Date.now()) {
      return next(new AppError(MESSAGES.AUTH.EXPIRED_TOKEN, 400))
    }
    const user = await userService.readOne({ _id: tokenData.id })
    if (!user) {
      return next(new AppError(MESSAGES.notFound('user'), 404))
    }
    if (user.status === UserStatus.Pending) {
      return next(new AppError(MESSAGES.AUTH.NOT_VERIFIED, 400))
    }
    if (password !== confirmPassword) {
      return next(new AppError(MESSAGES.AUTH.PASSWORD_MISMATCH, 400))
    }
    await authService.activateUser(user)
    user.password = password
    await user.save()
    return await sendSuccessResponse(res, {
      msg: MESSAGES.AUTH.PASSWORD_RESET
    })
  }

  async guestQuickRegister(
    req: Request<any, any, QuickGuestRegisterRequest>,
    res: Response<QuickGuestRegisterResponse>
  ) {
    const { fcmToken, device, email, name, phone, whatsapp } = req.body
    const password = passwordGenerator(10)
    const { user, token } = await authService.guestQuickRegister({
      email: email,
      role: UserRole.User,
      name: name,
      phone: phone,
      whatsapp: whatsapp,
      chatMeta: {
        online: false,
        typing: false
      },
      username: name?.replaceAll(/ /g, '-').toLowerCase() + (Date.now() % 10e6),
      password
    })
    await handleDeviceRegister(serializeDto<User>(user), fcmToken, device)
    return await sendSuccessResponse(res, {
      user: serializeDto<User>(user),
      token
    })
  }

  async logoutHandler(
    req: Request<any, any, LogoutRequestBody>,
    res: Response<LogoutResponse>
  ) {
    const { fcmToken } = req.body
    if (fcmToken) {
      const checkIfDeviceExist = await deviceService.readOne({
        fcmToken,
        user: req.user?._id
      })
      if (checkIfDeviceExist) {
        await deviceService.delete(
          { _id: checkIfDeviceExist._id },
          {
            actor: getActorData(req)
          }
        )
      }
    }
    return sendSuccessResponse(res, { msg: MESSAGES.AUTH.LOGGED_OUT })
  }

  async adminLoginAs(
    req: Request<any, any, LoginAsRequest>,
    res: Response<LoginAsResponse>
  ) {
    const { userId } = req.body
    if (!userId) throw new AppError(MESSAGES.missingData('userId'), 400)
    const { user, token } = await authService.adminLoginAs(userId)
    return sendSuccessResponse(res, { user: serializeDto<User>(user!), token })
  }
}

export const authController = new AuthController()
