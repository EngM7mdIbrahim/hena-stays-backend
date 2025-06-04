import { userDeletionCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  ChatTypes,
  CreateAsAdminBrokerRequest,
  CreateAsAdminCompanyRequest,
  CreateAsAdminRequest,
  CreateAsAdminResponse,
  CreateCompanyUserRequest,
  CreateCompanyUserResponse,
  DeleteUserRequestParams,
  DeleteUserResponse,
  GetAllUsersRequestQuery,
  GetAllUsersResponse,
  GetDefaultSupportUserResponse,
  GetOneUserParams,
  GetOneUserQuery,
  GetOneUserResponse,
  GetTopPerformersQuery,
  GetTopPerformersResponse,
  GetUserCommunityProfileRequestParams,
  GetUserCommunityProfileRequestQuery,
  GetUserCommunityProfileResponse,
  GetUserCommunityRequestQuery,
  GetUserCommunityResponse,
  UpdateAdminUserRequestBody,
  UpdateAdminUserRequestParams,
  UpdateAdminUserResponse,
  UpdateCompanyUserRequestBody,
  UpdateCompanyUserRequestParams,
  UpdateCompanyUserResponse,
  UpdateUserRequestBody,
  UpdateUserResponse,
  User,
  UserRole,
  UserStatus
} from '@commonTypes'
import { DEFAULT_USER_SUPPORT_INFO, MESSAGES } from '@constants'
import { AppError, IUserDocument, PopulatedUserDocument } from '@contracts'
import { BrokerRegisterValidation, CompanyRegisterValidation } from '@schema'
import {
  brokerService,
  chatService,
  companyService,
  followService,
  interactionsService,
  loggerService,
  paymentService,
  profileInteractionsService,
  propertyService,
  subscriptionsService,
  userService
} from '@services'
import { NextFunction, Request, Response } from 'express'

import {
  buildFilters,
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto,
  validateSchema
} from '@utils'

async function serializeUsersAndAddData(users: PopulatedUserDocument[]) {
  const serializedUsers = users.map((user) =>
    serializeDto<GetAllUsersResponse['items'][number]>(user)
  )
  for (const user of serializedUsers) {
    const totalFollowers = await followService.count({
      filter: {
        following: user._id
      }
    })
    const totalFollowing = await followService.count({
      filter: {
        follower: user._id
      }
    })
    user.totalFollowers = totalFollowers
    user.totalFollowing = totalFollowing
    let conversionRate = 0

    if (user.role === UserRole.Company) {
      user.agents = await userService.count({
        filter: {
          company:
            typeof user.company === 'string'
              ? user.company
              : (user.company?._id as string)
        }
      })
      const prePropertiesIds = await propertyService.findAll(
        {
          company:
            typeof user.company === 'string'
              ? user.company
              : (user.company?._id as string)
        },
        {
          select: '_id',
          populateFields: [],
          limit: Number.MAX_SAFE_INTEGER
        }
      )
      const propertiesIds = prePropertiesIds.results.map(
        (property) => property._id
      )
      if (propertiesIds.length !== 0) {
        const interactionsAnalytics =
          await interactionsService.interactionAnalytics({
            property: { $in: propertiesIds }
          })
        const totalLeads = await propertyService.count({
          filter: {
            company:
              typeof user.company === 'string'
                ? user.company
                : (user.company?._id as string)
          }
        })
        if (interactionsAnalytics.visitors !== 0) {
          conversionRate = Math.ceil(
            (totalLeads / interactionsAnalytics.visitors) * 100
          )
        }
        user.propertiesImpressions = interactionsAnalytics.impressions
        user.propertiesViews = interactionsAnalytics.views
      }
      user.profileViews = await profileInteractionsService.readOne(
        {
          user: user._id
        },
        {
          select: 'views visitors'
        }
      )
      user.conversionRate = conversionRate
      user.totalProperties = prePropertiesIds.totalResults
    } else {
      const prePropertiesIds = await propertyService.findAll(
        {
          createdBy: user._id
        },
        {
          select: '_id',
          populateFields: [],
          limit: Number.MAX_SAFE_INTEGER
        }
      )
      const propertiesIds = prePropertiesIds.results.map(
        (property) => property._id
      )
      if (propertiesIds.length !== 0) {
        const interactionsAnalytics =
          await interactionsService.interactionAnalytics({
            _id: { $in: propertiesIds }
          })
        const totalLeads = await propertyService.count({
          filter: {
            _id: { $in: propertiesIds }
          }
        })
        if (interactionsAnalytics.visitors !== 0) {
          conversionRate = Math.ceil(
            (totalLeads / interactionsAnalytics.visitors) * 100
          )
        }
        user.propertiesImpressions = interactionsAnalytics.impressions
        user.propertiesViews = interactionsAnalytics.views
      }
      user.profileViews = await profileInteractionsService.readOne(
        {
          user: user._id
        },
        {
          select: 'views visitors'
        }
      )
      user.conversionRate = conversionRate
      user.totalProperties = propertiesIds.length
    }
  }
  return serializedUsers
}

class UserController {
  // Public functions
  async getDefaultSupportUser(
    req: Request,
    res: Response<GetDefaultSupportUserResponse>
  ) {
    const user = await userService.readOne<PopulatedUserDocument>(
      { email: DEFAULT_USER_SUPPORT_INFO.email },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    return await sendSuccessResponse(res, { user: serializeDto<User>(user) })
  }
  // Request's user functions
  async updateMe(
    req: Request<any, any, UpdateUserRequestBody>,
    res: Response<UpdateUserResponse>
  ) {
    const notAllowedUpdates = ['_id', 'otp', 'otpExpires', 'role', 'status']
    notAllowedUpdates.forEach(
      (update) => delete (req.body as Record<string, any>)[update]
    )
    const user = await userService.update({ _id: req.user?._id }, req.body, {
      actor: getActorData(req)
    })
    return await sendSuccessResponse(res, {
      user: serializeDto<User>(user)
    })
  }
  async getMe(
    req: Request<any, any, any, GetOneUserQuery>,
    res: Response<GetOneUserResponse>
  ) {
    loggerService.info(`User ${req.user?._id} requested`)
    const populateFields = populationBuilder(req.query.showFields)
    const user = await userService.readOne<PopulatedUserDocument>(
      { _id: req.user?._id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    loggerService.info(`User ${req.user?._id} found`)
    return await sendSuccessResponse(res, { user: serializeDto<User>(user!) })
  }
  async deleteMe(req: Request, res: Response<DeleteUserResponse>) {
    const user = await userDeletionCombinedService.deleteUserAndRelatedEntities(
      {
        _id: req.user?._id
      },
      {
        actor: getActorData(req),
        session: req.dbSession
      }
    )
    return sendSuccessResponse(
      res,
      { user: serializeDto<User>(user!) },
      204,
      req
    )
  }

  // Admin functions
  async getAllAsAdmin(
    req: Request<any, any, any, GetAllUsersRequestQuery>,
    res: Response<GetAllUsersResponse>
  ) {
    let filter

    const { page, limit, sort } = getPaginationData(req.query)
    if (req.query?.filter) {
      filter = buildFilters<User>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)

    const users = await userService.findAll<PopulatedUserDocument>(
      { ...filter },
      {
        sort: sort ?? { createdAt: -1 },
        limit,
        page,
        populateFields
      }
    )
    const serializedUsers = await serializeUsersAndAddData(users.results)
    return await sendSuccessResponse(res, {
      items: serializedUsers,
      total: users.totalResults,
      limit,
      page,
      totalPages: users.totalPages
    })
  }
  async getOne(
    req: Request<GetOneUserParams, any, any, GetOneUserQuery>,
    res: Response<GetOneUserResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)
    const user = await userService.readOne<PopulatedUserDocument>(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    return await sendSuccessResponse(res, { user: serializeDto<User>(user!) })
  }
  async createAsAdmin(
    req: Request<any, any, CreateAsAdminRequest>,
    res: Response<CreateAsAdminResponse>,
    next: NextFunction
  ) {
    const notAllowedFields = ['_id', 'otp', 'otpExpires']
    notAllowedFields.forEach(
      (update) => delete (req.body as Record<string, any>)[update]
    )
    const checkUserExists = await userService.readOne({
      email: req.body.email.trim().toLowerCase()
    })
    if (checkUserExists && checkUserExists.deletedAt) {
      await userService.update(
        { email: req.body.email },
        { ...req.body, deletedAt: null },
        { actor: getActorData(req) }
      )
      const userUpdated = await userService.readOne({
        email: req.body.email.trim().toLowerCase()
      })
      return await sendSuccessResponse(res, {
        user: serializeDto<User>(userUpdated!)
      })
    } else if (checkUserExists) {
      return next(new AppError(MESSAGES.AUTH.USER_EXISTS, 400))
    }
    let user: IUserDocument
    const session = req.dbSession
    switch (req.body.role) {
      case UserRole.Admin:
      case UserRole.User:
      case UserRole.Support:
      case UserRole.AdminViewer: {
        user = await userService.create(
          {
            ...req.body,
            status: UserStatus.Active,
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData(req)
          }
        )
        if (user.role === UserRole.Support) {
          const allSupportChats = (
            await chatService.findAll(
              {
                type: ChatTypes.SUPPORT
              },
              { limit: Number.MAX_SAFE_INTEGER }
            )
          ).results
          await Promise.all(
            allSupportChats.map((chat) =>
              chatService.update(
                { _id: chat._id },
                { $push: { users: user._id } },
                { actor: getActorData() }
              )
            )
          )
        }
        break
      }
      case UserRole.Agent: {
        if (!req.body.company) {
          return next(new AppError(MESSAGES.AUTH.COMPANY_REQUIRED, 400))
        }
        const company = await companyService.readOne(
          {
            _id: req.body.company
          },
          {
            throwErrorIf: ActionToTakeTypes.NotFound
          }
        )

        const owner = await userService.readOne({
          _id: company.owner
        })

        user = await userService.create(
          {
            ...req.body,
            role: UserRole.Agent,
            status: UserStatus.Active,
            subscription: owner?.subscription?.toString(),
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData(req)
          }
        )
        break
      }
      case UserRole.CompanyAdmin: {
        if (!req.body.company) {
          return next(new AppError(MESSAGES.AUTH.COMPANY_REQUIRED, 400))
        }
        const company = await companyService.readOne(
          {
            _id: req.body.company
          },
          { throwErrorIf: ActionToTakeTypes.NotFound }
        )
        const owner = await userService.readOne({
          _id: company.owner
        })
        user = await userService.create(
          {
            ...req.body,
            role: UserRole.CompanyAdmin,
            status: UserStatus.Active,
            subscription: owner?.subscription?.toString(),
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData(req)
          }
        )
        break
      }
      case UserRole.Broker: {
        await validateSchema(BrokerRegisterValidation, req.body)
        const { city, licenseCopies, licenseExpiryDate, license, watermark } =
          req.body as CreateAsAdminBrokerRequest
        const broker = await brokerService.create(
          {
            city,
            licenseCopies,
            licenseExpiryDate,
            license,
            watermark
          },
          { actor: getActorData(req), session }
        )

        user = await userService.create(
          {
            ...req.body,
            role: UserRole.Broker,
            broker: String(broker._id),
            status: UserStatus.Active,
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData(req),
            session
          }
        )
        const stripeCustomerId = await paymentService.getCustomerId(
          user.email,
          user.name
        )
        const subscription = await subscriptionsService.create(
          {
            user: user._id.toString(),
            credits: 0
          },
          { actor: getActorData(req), session }
        )
        await userService.update(
          { _id: user._id },
          { subscription: subscription._id.toString(), stripeCustomerId },
          { actor: getActorData(req), session }
        )
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
        } = req.body as CreateAsAdminCompanyRequest

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
        user = await userService.create(
          {
            ...req.body,
            company: company._id.toString(),
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData(req),
            session
          }
        )
        const stripeCustomerId = await paymentService.getCustomerId(
          user.email,
          user.name
        )
        const subscription = await subscriptionsService.create(
          {
            user: user._id.toString(),
            credits: 0
          },
          { actor: getActorData(req), session }
        )
        await userService.update(
          { _id: user._id },
          { subscription: subscription._id.toString(), stripeCustomerId },
          { actor: getActorData(req), session }
        )
        break
      }
      default: {
        throw new AppError(MESSAGES.AUTH.INVALID_ROLE, 400)
      }
    }
    return await sendSuccessResponse(
      res,
      {
        user: serializeDto<User>(user)
      },
      201,
      req
    )
  }
  async updateUserAsAdmin(
    req: Request<UpdateAdminUserRequestParams, any, UpdateAdminUserRequestBody>,
    res: Response<UpdateAdminUserResponse>
  ) {
    await userService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    const notAllowedUpdates = ['_id']
    notAllowedUpdates.forEach(
      (update) => delete (req.body as Record<string, any>)[update]
    )

    const userAfterUpdate = await userService.update(
      { _id: req.params.id },
      req.body,
      { actor: getActorData(req) }
    )
    return await sendSuccessResponse(res, {
      user: serializeDto<User>(userAfterUpdate)
    })
  }
  async deleteUser(
    req: Request<DeleteUserRequestParams>,
    res: Response<DeleteUserResponse>
  ) {
    const user = await userDeletionCombinedService.deleteUserAndRelatedEntities(
      { _id: req.params.id },
      { actor: getActorData(req), session: req.dbSession }
    )
    return await sendSuccessResponse(
      res,
      { user: serializeDto<User>(user!) },
      204,
      req
    )
  }

  // Company functions
  async readAllAsCompany(
    req: Request<any, any, any, GetAllUsersRequestQuery>,
    res: Response<GetAllUsersResponse>
  ) {
    const { page, limit, sort, filter } = getPaginationData(req.query)
    const populateFields = populationBuilder(req.query.showFields)

    const users = await userService.findAll<PopulatedUserDocument>(
      {
        ...filter,
        company: req.user?.company
      },
      {
        sort: sort ?? { createdAt: -1 },
        limit,
        page,
        populateFields
      }
    )
    loggerService.info(`User ${req.user?._id} requested`)
    const serializedUsers = await serializeUsersAndAddData(users.results)

    return await sendSuccessResponse(res, {
      items: serializedUsers,
      total: users?.totalResults,
      limit,
      page,
      totalPages: users?.totalPages
    })
  }
  async getOneAsCompany(
    req: Request<GetOneUserParams, any, any, GetOneUserQuery>,
    res: Response<GetOneUserResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)

    const user = await userService.readOne<PopulatedUserDocument>(
      {
        _id: req.params.id,
        company: req.user?.company
      },
      { throwErrorIf: ActionToTakeTypes.NotFound, populateFields }
    )
    loggerService.info(`User ${req.user?._id} found`)
    return await sendSuccessResponse(res, { user: serializeDto<User>(user!) })
  }
  async createAsCompany(
    req: Request<any, any, CreateCompanyUserRequest>,
    res: Response<CreateCompanyUserResponse>,
    next: NextFunction
  ) {
    const notAllowedFields = [
      '_id',
      'otp',
      'otpExpires',
      'status',
      'company',
      'broker'
    ]
    notAllowedFields.forEach(
      (update: string) => delete (req.body as Record<string, any>)[update]
    )
    if (req.body.role) {
      const allowedRoles = [UserRole.CompanyAdmin, UserRole.Agent]
      if (
        !allowedRoles.includes(
          String(req.body?.role) as 'CompanyAdmin' | 'Agent'
        )
      ) {
        {
          return next(new AppError(MESSAGES.AUTH.INVALID_ROLE, 400))
        }
      }
      const checkUserExists = await userService.readOne(
        {
          email: req.body.email.trim().toLowerCase()
        },
        {
          includeDeleted: true
        }
      )

      if (checkUserExists && checkUserExists.deletedAt) {
        await userService.update(
          { email: req.body.email },
          {
            ...req.body,
            deletedAt: null,
            company: req.user?.company,
            status: UserStatus.Active,
            subscription: req.user?.subscription?.toString()
          },
          { actor: getActorData(req) }
        )
        const userUpdated = await userService.readOne(
          {
            email: req.body.email.trim().toLowerCase()
          },
          { throwErrorIf: ActionToTakeTypes.NotFound }
        )
        return await sendSuccessResponse(res, {
          user: serializeDto<User>(userUpdated) as User
        })
      } else if (checkUserExists) {
        return next(new AppError(MESSAGES.AUTH.USER_EXISTS, 400))
      }
      const user = await userService.create(
        {
          ...req.body,
          company: String(req.user?.company?._id),
          status: UserStatus.Active,
          subscription: req.user?.subscription?.toString(),
          chatMeta: {
            online: false,
            typing: false
          }
        },
        { actor: getActorData(req) }
      )
      return await sendSuccessResponse(
        res,
        { user: serializeDto<User>(user) as User },
        201
      )
    }
  }
  async updateUserAsCompany(
    req: Request<
      UpdateCompanyUserRequestParams,
      any,
      UpdateCompanyUserRequestBody
    >,
    res: Response<UpdateCompanyUserResponse>,
    next: NextFunction
  ) {
    await userService.readOne(
      {
        _id: req.params.id,
        company: req.user?.company
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    const notAllowedUpdates = ['_id', 'otp', 'otpExpires', 'status', 'email']
    notAllowedUpdates.forEach(
      (update) => delete (req.body as Record<string, any>)[update]
    )
    if (req.body.role) {
      const allowedRoles = [UserRole.CompanyAdmin, UserRole.Agent]
      if (!allowedRoles.includes(req.body.role as 'CompanyAdmin' | 'Agent')) {
        return next(new AppError(MESSAGES.AUTH.INVALID_ROLE, 400))
      }
    }
    const userAfterUpdate = await userService.update(
      { _id: req.params.id, company: req.user?.company },
      req.body,
      { actor: getActorData(req) }
    )
    return await sendSuccessResponse(res, {
      user: serializeDto<User>(userAfterUpdate) as User
    })
  }
  async deleteAsCompany(
    req: Request<DeleteUserRequestParams>,
    res: Response<DeleteUserResponse>
  ) {
    const user = await userDeletionCombinedService.deleteUserAndRelatedEntities(
      {
        _id: req.params.id,
        company: req.user?.company
      },
      { actor: getActorData(req), session: req.dbSession }
    )
    return await sendSuccessResponse(
      res,
      { user: serializeDto<User>(user!) },
      204,
      req
    )
  }

  // Public functions
  async getCommunityUsers(
    req: Request<any, any, any, GetUserCommunityRequestQuery>,
    res: Response<GetUserCommunityResponse>
  ) {
    const { limit } = getPaginationData(req.query)

    const users = await userService.getRandomUsers(
      { role: { $in: [UserRole.Broker, UserRole.Company] } },
      limit
    )

    sendSuccessResponse(res, {
      users: users
    })
  }
  async getOneUserCommunity(
    req: Request<
      GetUserCommunityProfileRequestParams,
      any,
      any,
      GetUserCommunityProfileRequestQuery
    >,
    res: Response<GetUserCommunityProfileResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)

    const user = await userService.readOne<PopulatedUserDocument>(
      {
        _id: req.params.id
      },
      {
        populateFields,
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )

    const totalFollowers = await followService.count({
      filter: {
        following: user?._id
      }
    })

    const totalFollowing = await followService.count({
      filter: {
        follower: user?._id
      }
    })
    sendSuccessResponse(res, {
      user: serializeDto<User>(user!),
      totalFollowers,
      totalFollowing
    })
  }

  async getTopPerformers(
    req: Request<any, any, any, GetTopPerformersQuery>,
    res: Response<GetTopPerformersResponse>
  ) {
    const { limit } = getPaginationData(req.query)
    const topPerformers = await interactionsService.getTopPerformers(limit)
    return await sendSuccessResponse(res, topPerformers)
  }
}

export const userController = new UserController()
