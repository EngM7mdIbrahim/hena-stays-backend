import {
  ActionToTakeTypes,
  RecommendationConfig,
  RecommendationTypeEnum,
  RecommendationTypeEnumType,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError, IUserDocument } from '@contracts'
import {
  configsService,
  loggerService,
  propertyService,
  subscriptionsService
} from '@services'
import { ClientSession } from 'mongoose'

class SubscriptionsPropertyCombinedService {
  async getRecommendationPrice(
    recommended: string,
    recommendationNoExpireDays = 0
  ) {
    const config = (await configsService.readOne({}, {}))!
    const recommendationKeys = {
      [RecommendationTypeEnum.HotDeal]: 'hot',
      [RecommendationTypeEnum.PropertyOfTheWeek]: 'propertyOfWeek',
      [RecommendationTypeEnum.Signature]: 'signature'
    }

    if (!(recommended in recommendationKeys)) {
      throw new AppError('Unknown recommendation type', 400)
    }

    const recommendationKey =
      recommendationKeys[recommended as keyof typeof recommendationKeys]
    const recommendation =
      config.propertyRecommendations[
        recommendationKey as keyof typeof config.propertyRecommendations
      ]

    if (!recommendation) {
      throw new AppError('Unknown recommendation type', 400)
    }

    const recommendationItem = recommendation.find(
      (item: RecommendationConfig) =>
        item.noExpireDays === recommendationNoExpireDays
    )
    if (!recommendationItem) {
      throw new AppError('Unknown recommendation duration', 400)
    }
    if (recommendationItem.price === undefined) {
      throw new AppError(
        'Recommendation price is not defined for this duration',
        500
      )
    }
    return recommendationItem.price
  }

  async bulkUpdatePropertyRecommendations(
    user: IUserDocument,
    propertyIds: string[],
    recommendationType: RecommendationTypeEnumType,
    recommendationNoExpireDays: number,
    session: ClientSession,
    actor: string
  ) {
    const recommendationPrice = await this.getRecommendationPrice(
      recommendationType,
      recommendationNoExpireDays
    )
    loggerService.log(
      `Updating ${propertyIds.length} properties with recommendation ${recommendationType} for ${recommendationNoExpireDays} days`
    )
    loggerService.log(`user: ${JSON.stringify(user, null, 2)}`)
    loggerService.log(`propertyIds: ${JSON.stringify(propertyIds, null, 2)}`)
    const totalCost = propertyIds.length * recommendationPrice

    const subscription = await subscriptionsService.readOne(
      { _id: user.subscription },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    if (subscription.credits < totalCost) {
      throw new AppError(MESSAGES.SUBSCRIPTIONS.INSUFFICIENT_CREDITS, 400)
    }
    const ownershipFilter =
      user.role === UserRole.Company || user.role === UserRole.CompanyAdmin
        ? {
            company: user.company
          }
        : {
            owner: user._id
          }
    const propertiesToUpdate = await propertyService.findAll(
      {
        ...ownershipFilter,
        _id: { $in: propertyIds }
      },
      {
        limit: Number.MAX_SAFE_INTEGER
      }
    )

    if (propertiesToUpdate.results.length !== propertyIds.length) {
      throw new AppError('Some properties were not found', 400)
    }

    await propertyService.updateMany(
      {
        _id: { $in: propertyIds }
      },
      {
        $set: {
          recommended: recommendationType,
          recommendationExpiresAt: recommendationNoExpireDays
            ? new Date(
                Date.now() + recommendationNoExpireDays * 24 * 60 * 60 * 1000
              )
            : null
        }
      },
      {
        session,
        actor
      }
    )

    await subscriptionsService.update(
      { _id: subscription._id },
      { $inc: { credits: -totalCost } },
      {
        session,
        actor
      }
    )
    return
  }
}

export const subscriptionsPropertyCombinedService =
  new SubscriptionsPropertyCombinedService()
