import { ActionToTakeTypes } from '@commonTypes'
import { DeleteExtraConfig, ICompanyDocument, IUserDocument } from '@contracts'
import {
  blogService,
  brokerService,
  commentService,
  deviceService,
  followService,
  internalCompanyService,
  internalUserService,
  leadsService,
  likeService,
  loggerService,
  notificationsService,
  postSaveService,
  postService,
  profileInteractionsService,
  projectService,
  propertySaveService,
  propertyService,
  requestBuyPropertyService,
  requestSellPropertyService,
  userService,
  userViewPostsService,
  userViewsPropertiesService,
  userViewUsersService
} from '@services'
import { FilterQuery } from 'mongoose'

class UserDeletionCombinedService {
  async deleteUserAndRelatedEntities(
    filter: FilterQuery<IUserDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    extraConfig = { actor: extraConfig.actor }
    const user = await internalUserService.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound,
      populateFields: ['company']
    })
    // company
    if (user.company && user._id.toString() === user.company.owner.toString()) {
      await this.deleteCompanyAndRelatedEntities(
        { _id: user.company._id },
        extraConfig
      )
    }
    if (user.broker) {
      await brokerService.delete({ _id: user.broker }, extraConfig)
    }

    // community
    loggerService.info('Deleting user posts...')
    await postService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user posts saves...')
    await postSaveService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user posts views...')
    await userViewPostsService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user comments...')
    await commentService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user likes...')
    await likeService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user follows...')
    await followService.deleteMany(
      {
        $or: [{ follower: user._id }, { following: user._id }]
      },
      extraConfig
    )
    loggerService.info('Deleting user blogs...')
    await blogService.deleteMany({ user: user._id }, extraConfig)
    // property
    loggerService.info('Deleting user projects...')
    await projectService.deleteMany({ owner: user._id }, extraConfig)
    loggerService.info('Deleting user properties...')
    await propertyService.deleteMany({ createdBy: user._id }, extraConfig)
    loggerService.info('Deleting user properties saves...')
    await propertySaveService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user properties requests sell...')
    await requestSellPropertyService.deleteMany(
      { createdBy: user._id },
      extraConfig
    )
    loggerService.info('Deleting user properties requests buy...')
    await requestBuyPropertyService.deleteMany(
      { createdBy: user._id },
      extraConfig
    )
    // await propertyXmlService.deleteMany({ creator: user!._id }, extraConfig)
    loggerService.info('Deleting user properties views...')
    await userViewsPropertiesService.deleteMany(
      { user: user!._id },
      extraConfig
    )
    // user
    loggerService.info('Deleting user profile interactions...')
    await profileInteractionsService.delete({ user: user._id }, extraConfig)
    loggerService.info('Deleting user leads...')
    await leadsService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user views...')
    await userViewUsersService.deleteMany(
      {
        $or: [{ user: user._id }, { userViewed: user._id }]
      },
      extraConfig
    )
    loggerService.info('Deleting user notifications...')
    await notificationsService.deleteMany({ user: user._id }, extraConfig)
    loggerService.info('Deleting user devices...')
    await deviceService.deleteMany({ user: user._id }, extraConfig)

    loggerService.info('Deleting user...')
    await internalUserService.delete(filter, extraConfig)
    return user
  }
  async deleteCompanyAndRelatedEntities(
    filter: FilterQuery<ICompanyDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    const company = await internalCompanyService.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound
    })
    const users = await internalUserService.findAll({
      _id: { $ne: company.owner },
      company: company._id
    })
    await Promise.all(
      users.results.map(async (user) => {
        await this.deleteUserAndRelatedEntities({ _id: user._id }, extraConfig)
      })
    )
    await internalCompanyService.delete(filter, extraConfig)
  }
  async hardDeleteCompanyAndRelatedEntities(
    filter: FilterQuery<ICompanyDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    const company = await internalCompanyService.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound
    })
    const users = await internalUserService.findAll({
      _id: { $ne: company.owner },
      company: company._id
    })
    await Promise.all(
      users.results.map(async (user) => {
        await this.hardDeleteUserAndRelatedEntities(
          { _id: user._id },
          extraConfig
        )
      })
    )
    await internalCompanyService.hardDelete(filter, extraConfig)
  }

  async hardDeleteUserAndRelatedEntities(
    filter: FilterQuery<IUserDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    const user = await internalUserService.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound,
      populateFields: ['company']
    })
    // company
    if (user.company && user._id.toString() === user.company.owner.toString()) {
      await this.hardDeleteCompanyAndRelatedEntities(
        { _id: user.company._id },
        extraConfig
      )
    }
    if (user.broker) {
      await brokerService.delete({ _id: user.broker }, extraConfig)
    }

    // community
    await postService.hardDeleteMany({ user: user._id }, extraConfig)
    await postSaveService.hardDeleteMany({ user: user._id }, extraConfig)
    await userViewPostsService.hardDeleteMany({ user: user._id }, extraConfig)
    await commentService.hardDeleteMany({ user: user._id }, extraConfig)
    await likeService.hardDeleteMany({ user: user._id }, extraConfig)
    await followService.hardDeleteMany(
      {
        $or: [{ follower: user._id }, { following: user._id }]
      },
      extraConfig
    )
    await blogService.hardDeleteMany({ user: user._id }, extraConfig)
    // property
    await projectService.hardDeleteMany({ owner: user._id }, extraConfig)
    await propertyService.hardDeleteMany({ createdBy: user._id }, extraConfig)
    await propertySaveService.hardDeleteMany({ user: user._id }, extraConfig)
    await requestSellPropertyService.hardDeleteMany(
      { createdBy: user._id },
      extraConfig
    )
    await requestBuyPropertyService.hardDeleteMany(
      { createdBy: user._id },
      extraConfig
    )
    // await propertyXmlService.hardDeleteMany({ creator: user!._id }, extraConfig)
    await userViewsPropertiesService.hardDeleteMany(
      { user: user._id },
      extraConfig
    )
    // user
    await profileInteractionsService.deleteMany({ user: user._id }, extraConfig)
    await leadsService.hardDeleteMany({ user: user._id }, extraConfig)
    await userViewUsersService.hardDeleteMany(
      {
        $or: [{ user: user._id }, { userViewed: user._id }]
      },
      extraConfig
    )
    await notificationsService.hardDeleteMany({ user: user._id }, extraConfig)
    await deviceService.hardDeleteMany({ user: user._id }, extraConfig)

    await userService.hardDelete(filter, extraConfig)
    return user
  }
}

export const userDeletionCombinedService = new UserDeletionCombinedService()
