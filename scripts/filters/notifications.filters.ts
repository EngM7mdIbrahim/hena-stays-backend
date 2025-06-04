import { Db } from 'mongodb'
import { OldNotifications } from 'scripts/interfaces-v1/notifications.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getNotificationsWithNoUser = async (sourceDB: Db) => {
  const notificationsWithNoUser: OldNotifications[] = []
  const notifications = ((await sourceDB
    .collection('notifications')
    .find({})
    .toArray()) ?? []) as OldNotifications[]
  for (const notification of notifications) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: notification.user })
    if (!user) {
      notificationsWithNoUser.push(notification)
    }
  }
  return notificationsWithNoUser
}

const getNotificationsOlderThanThreeMonths = async (sourceDB: Db) => {
  return ((await sourceDB
    .collection('notifications')
    .find({
      createdAt: { $lt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) }
    })
    .toArray()) ?? []) as OldNotifications[]
}

export async function filterNotifications(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted notifications...')
  const deletedNotifications = await getDeletedEntities<OldNotifications>(
    sourceDB,
    'notifications'
  )
  logger(`Found ${deletedNotifications.length} deleted notifications:`)
  logger(deletedNotifications)
  logger('Checking for notifications with no user...')
  const notificationsWithNoUser = await getNotificationsWithNoUser(sourceDB)
  logger(`Found ${notificationsWithNoUser.length} notifications with no user:`)
  logger(notificationsWithNoUser)
  logger('Checking for notifications older than 3 months...')
  const notificationsOlderThanThreeMonths =
    await getNotificationsOlderThanThreeMonths(sourceDB)
  logger(
    `Found ${notificationsOlderThanThreeMonths.length} notifications older than 3 months:`
  )
  logger(notificationsOlderThanThreeMonths)
  const uniqueNotifications = getUniqueEntities<OldNotifications>([
    ...deletedNotifications,
    ...notificationsWithNoUser,
    ...notificationsOlderThanThreeMonths
  ])
  if (uniqueNotifications.length > 0) {
    logger('Deleting notifications with no user...')
    for (const notification of uniqueNotifications) {
      await deleteEntity(
        sourceDB,
        'notifications',
        'notification',
        { _id: notification._id },
        logger
      )
    }
  } else {
    logger('No notifications with no user found, skipping filtering ...')
  }
}
