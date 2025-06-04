import type { CreateSubscriptionsDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldSubscription } from 'scripts/interfaces-v1'

export const subscriptionsMigration = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: string) => void
) => {
  const sourceSubscriptionsModel = sourceDB.collection('subscriptions')
  const subscriptions = (await sourceSubscriptionsModel
    .find()
    .sort({ createdAt: 1 })
    .toArray()) as OldSubscription[]
  const targetSubscriptionsModel = targetDB.collection('subscriptions')

  const targetUserModel = targetDB.collection('users')
  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i]
    if (!subscription) {
      logger('Subscription not found, skipping...')
      continue
    }
    const user = await targetUserModel.findOne({ _id: subscription.user })
    if (!user) {
      logger(
        `User not found for subscription: ${subscription._id} in the targetDB, skipping...`
      )
      continue
    }
    const newSubscription: Omit<CreateSubscriptionsDto, 'user'> & {
      _id: Types.ObjectId
      user: Types.ObjectId
      createdAt: Date
      updatedAt: Date
    } = {
      _id: new Types.ObjectId(subscription._id.toString()),
      user: new Types.ObjectId(subscription.user.toString()),
      credits: subscription.credits,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    }
    await targetSubscriptionsModel.insertOne(newSubscription)
    logger(`Subscription ${subscription._id} migrated successfully`)
  }
}
