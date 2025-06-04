import {
  ActionToTakeTypes,
  LoggedInModes,
  LoginRequest,
  RegisterUserRequest,
  RegisterUserResponse,
  UserRole,
  UserStatus
} from '@commonTypes'
import { env } from '@config'
import { MESSAGES } from '@constants'
import {
  AppError,
  CreateUserDto,
  IUserDocument,
  ResetPasswordTokenPayload
} from '@contracts'
import bcrypt from 'bcrypt'
import moment from 'moment'
import { ClientSession } from 'mongoose'

import { getActorData, signJwt, verifyJwt } from '@utils'

import { emailService } from './email.service'
import { loggerService } from './logger.service'
import { userService } from './user.service'

class AuthService {
  async login(data: Pick<LoginRequest, 'email' | 'password'>) {
    const user = await userService.readOne({ email: data.email })

    if (!user) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 400)
    }
    const passwordMatch = AuthService.comparePassword(
      data.password,
      user.password
    )
    if (!passwordMatch) {
      throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 400)
    }
    if (user.status !== UserStatus.Active) {
      if (user.status === UserStatus.Pending) {
        throw new AppError(MESSAGES.AUTH.NOT_VERIFIED, 400)
      }
      if (user.status === UserStatus.Blocked) {
        throw new AppError(MESSAGES.AUTH.BLOCKED, 400)
      }
    }

    const token = this.createToken({
      id: user._id.toString(),
      mode: LoggedInModes.USER
    })

    return { token, user }
  }

  async emailRecovery(user: IUserDocument, session?: ClientSession) {
    const recoveredEmail = `${user.email.split('@')[0]}+${Date.now()}+recovered@${user.email.split('@')[1]}`
    loggerService.info(
      `Email ${user.email} already exists. Recovering email to ${recoveredEmail}`
    )
    await userService.update(
      { _id: user._id, deletedAt: { $ne: null } },
      { email: recoveredEmail, username: `${user.username}+${Date.now()}` },
      { actor: getActorData(), includeDeleted: true, session }
    )
    loggerService.info(
      `Email ${user.email} has been recovered to ${recoveredEmail}`
    )
  }
  async userRegister(
    data: RegisterUserRequest,
    session: ClientSession
  ): Promise<RegisterUserResponse> {
    const emailExists = await userService.readOne(
      { email: data.email, deletedAt: { $ne: null } },
      { includeDeleted: true, session }
    )
    if (emailExists) {
      await this.emailRecovery(emailExists, session)
    }

    const user = await userService.create(
      {
        ...data,
        role: UserRole.User,
        chatMeta: {
          online: false,
          typing: false
        }
      },
      { session, actor: getActorData() }
    )
    const token = this.createToken({
      id: user._id.toString(),
      mode: LoggedInModes.USER
    })
    return { token, user: user.toJSON() } as unknown as RegisterUserResponse
  }

  static comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword)
  }
  createToken(payload: {
    id: string
    mode: (typeof LoggedInModes)[keyof typeof LoggedInModes]
  }) {
    return signJwt(payload)
  }

  static async checkUserExists(email: string) {
    const user = await userService.readOne({ email })
    return Boolean(user)
  }
  async companyRegister(
    data: CreateUserDto,
    session: ClientSession
  ): Promise<IUserDocument> {
    const emailExists = await userService.readOne(
      { email: data.email, deletedAt: { $ne: null } },
      { includeDeleted: true, session }
    )
    if (emailExists) {
      await this.emailRecovery(emailExists, session)
    }
    const user = await userService.create(data, {
      session,
      actor: getActorData()
    })
    return user
  }
  async brokerRegister(
    data: CreateUserDto,
    session: ClientSession
  ): Promise<IUserDocument> {
    const emailExists = await userService.readOne(
      { email: data.email, deletedAt: { $ne: null } },
      { includeDeleted: true, session }
    )
    if (emailExists) {
      await this.emailRecovery(emailExists, session)
    }
    const user = await userService.create(data, {
      session,
      actor: getActorData()
    })
    return user
  }

  async forgetPassword(email: string) {
    const user = await userService.readOne({ email })
    if (!user) {
      throw new AppError(MESSAGES.notFound('user'), 404)
    }
    if (user.status === UserStatus.Pending) {
      throw new AppError(MESSAGES.AUTH.NOT_VERIFIED, 400)
    }
    if (user.status === UserStatus.Blocked) {
      throw new AppError(MESSAGES.AUTH.BLOCKED, 400)
    }

    const resetToken = AuthService.generateResetToken({
      id: user._id.toString(),
      expiresIn: moment()
        .add(env.FORGET_PASSWORD_EXPIRES_IN, 'milliseconds')
        .format('YYYY-MM-DD HH:mm:ss')
    })
    return resetToken
  }
  async verifyForgetPasswordToken(token: string) {
    const data = AuthService.verifyResetToken(token)
    return data
  }
  static generateResetToken(data: ResetPasswordTokenPayload) {
    return signJwt(data)
  }

  static verifyResetToken(token: string) {
    const data = verifyJwt<ResetPasswordTokenPayload>(token)

    return data
  }
  async activateUser(user: IUserDocument) {
    user.status = UserStatus.Active
    user.otp = null
    user.otpExpires = null
    await user.save()
  }

  async guestQuickRegister(data: CreateUserDto) {
    const emailExists = await userService.readOne(
      { email: data.email, deletedAt: { $ne: null } },
      { includeDeleted: true }
    )
    if (emailExists) {
      await this.emailRecovery(emailExists)
    }
    const user = await userService.create(data, { actor: getActorData() })
    const token = this.createToken({
      id: user._id.toString(),
      mode: LoggedInModes.USER
    })
    await emailService.sendRegisterEmailWithPassword(user.email, data.password)
    return { user, token }
  }
  async adminLoginAs(userId: string) {
    const user = await userService.readOne(
      { _id: userId },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (user?.isBlocked) {
      throw new AppError(MESSAGES.AUTH.BLOCKED, 400)
    }
    const token = this.createToken({
      id: user!._id.toString(),
      mode: LoggedInModes.ADMIN
    })

    return { token, user }
  }
}

export const authService = new AuthService()
