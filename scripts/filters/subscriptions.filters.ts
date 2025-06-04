import { Db } from 'mongodb'
import { OldSubscription } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getSubscriptionsWithNoUser = async (sourceDB: Db) => {
  const subscriptionsWithNoUser: OldSubscription[] = []
  const subscriptions = ((await sourceDB
    .collection('subscriptions')
    .find({})
    .toArray()) ?? []) as OldSubscription[]
  for (const subscription of subscriptions) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: subscription.user })
    if (!user) {
      subscriptionsWithNoUser.push(subscription)
    }
  }
  return subscriptionsWithNoUser
}

export async function filterSubscriptions(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted subscriptions...')
  const deletedSubscriptions = await getDeletedEntities<OldSubscription>(
    sourceDB,
    'subscriptions'
  )
  logger(`Found ${deletedSubscriptions.length} deleted subscriptions:`)
  logger(deletedSubscriptions)
  const subscriptions = await getSubscriptionsWithNoUser(sourceDB)
  logger(`Found ${subscriptions.length} subscriptions with no user:`)
  logger(subscriptions)
  const uniqueSubscriptions = getUniqueEntities<OldSubscription>([
    ...deletedSubscriptions,
    ...subscriptions
  ])
  if (uniqueSubscriptions.length > 0) {
    logger('Deleting subscriptions with no user...')
    for (const subscription of uniqueSubscriptions) {
      await deleteEntity(
        sourceDB,
        'subscriptions',
        'subscription',
        {
          _id: subscription._id
        },
        logger
      )
    }
  } else {
    logger('No subscriptions with no user found, skipping filtering...')
  }
}
