import { NotificationTypes } from '@commonTypes'
import { CreateNotificationDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldNotifications } from 'scripts/interfaces-v1/notifications.interface-v1'

const oldStatus = {
  'Active': 'Active',
  'Not Active': 'Not Active',
  'Processed': 'Processed'
}

const mappingStatus = {
  [oldStatus['Active']]: 'Active',
  [oldStatus['Not Active']]: 'Inactive',
  [oldStatus['Processed']]: 'Inactive'
}

const isObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str)

const getNotificationTypeAndPayload = (link: string) => {
  const parts = link.split('/').filter(Boolean)

  // Skip membership notifications
  if (parts[0] === 'membership') {
    return null
  }

  // Extract the last part that looks like an ObjectId
  const lastId = parts.reverse().find((part) => isObjectId(part))
  if (!lastId) {
    return {
      type: NotificationTypes.Other,
      payload: {} as Record<string, string>
    }
  }

  // Determine type based on URL pattern
  if (link.includes('/property-requests/')) {
    return {
      type: NotificationTypes.BuyPropertyRequest,
      payload: {
        _id: lastId,
        createdBy: '' // Will be populated during migration
      }
    }
  }

  if (link.includes('/dashboard/Company/sellings/property/')) {
    return {
      type: NotificationTypes.Property,
      payload: {
        _id: lastId,
        createdBy: '' // Will be populated during migration
      }
    }
  }

  if (link.includes('/community/profile/')) {
    if (link.includes('post=')) {
      const postId = link.split('post=')[1]?.split('?')[0]
      return {
        type: NotificationTypes.Comment,
        payload: {
          _id: lastId,
          user: '', // Will be populated during migration
          post: postId || ''
        }
      }
    }
    return {
      type: NotificationTypes.Follow,
      payload: {
        follower: '', // Will be populated during migration
        following: lastId
      }
    }
  }

  if (link.includes('/admin/messaging')) {
    return {
      type: NotificationTypes.Message,
      payload: {
        _id: lastId,
        sender: '', // Will be populated during migration
        chat: '' // Will be populated during migration
      }
    }
  }

  return {
    type: NotificationTypes.Other,
    payload: {}
  }
}

export const notificationsMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const sourceNotificationModel = sourceDB?.collection('notifications')
  const targetNotificationModel = targetDB?.collection('notifications')
  const targetUserModel = targetDB?.collection('users')

  const sourceData = await sourceNotificationModel
    .find()
    .sort({
      createdAt: 1
    })
    .toArray()

  for (let index = 0; index < sourceData.length; index++) {
    const notification = sourceData[index]
    const notificationWithType = notification as unknown as OldNotifications
    logger(`Migrating notification: ${notificationWithType._id}`)

    const user = await targetUserModel?.findOne({
      _id: notificationWithType.user
    })
    if (!user) {
      logger(`User not found, skipping ${notificationWithType._id}`)
      continue
    }

    const typeAndPayload = getNotificationTypeAndPayload(
      notificationWithType.link || ''
    )

    // Skip if no type and payload (e.g., membership notifications)
    if (!typeAndPayload) {
      continue
    }

    const { type, payload } = typeAndPayload

    // Update payload with user information where needed
    const updatedPayload = { ...payload }
    if (type === NotificationTypes.Message) {
      updatedPayload.sender = String(user._id)
    } else if (type === NotificationTypes.Comment) {
      updatedPayload.user = String(user._id)
    } else if (type === NotificationTypes.Follow) {
      updatedPayload.follower = String(user._id)
    } else if (
      type === NotificationTypes.Property ||
      type === NotificationTypes.BuyPropertyRequest
    ) {
      updatedPayload.createdBy = String(user._id)
    }

    const newNotification: CreateNotificationDto & {
      _id: Types.ObjectId
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
    } = {
      _id: new Types.ObjectId(String(notificationWithType._id)),
      user: new Types.ObjectId(String(user._id)) as any,
      title: notificationWithType.title,
      body: notificationWithType.body,
      type,
      read: notificationWithType.seen ?? false,
      createdAt: new Date(notificationWithType.createdAt),
      updatedAt: new Date(notificationWithType.updatedAt),
      deletedAt: notificationWithType.deleted ? new Date() : null,
      payload: updatedPayload,
      image: notificationWithType.image
    }

    await targetNotificationModel?.insertOne(newNotification)
  }
}
