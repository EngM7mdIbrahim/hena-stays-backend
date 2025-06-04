import { NotificationToPayloadMap } from '@commonTypes'
import { firebaseAdmin } from '@config'
import { CreateNotificationDto, IUserDocument } from '@contracts'
import {
  deviceService,
  loggerService,
  notificationsService,
  userService
} from '@services'
import { FilterQuery, Schema } from 'mongoose'

import { getActorData } from '@utils'

export class NotificationDeviceCombinedService {
  constructor() {}
  private async removeExpiredToken(token: string, userId: string) {
    try {
      const device = await deviceService.readOne({ fcmToken: token })
      if (device) {
        await deviceService.delete(
          { _id: device._id },
          { actor: getActorData() }
        )
        loggerService.info(
          `Successfully removed the expired device: ${token} for user: ${userId}`
        )
      }
    } catch (error: any) {
      loggerService.error(
        `Failed to remove the expired device: ${token} for user: ${userId} ${error?.message}`
      )
    }
  }
  async sendPushNotificationToAllUsers<
    T extends keyof NotificationToPayloadMap
  >(
    type: T,
    {
      notificationData,
      usersIds = [],
      filters = {}
    }: {
      notificationData: Omit<CreateNotificationDto<T>, 'user' | 'read' | 'type'>
      usersIds?: Schema.Types.ObjectId[]
      filters?: FilterQuery<IUserDocument>
    }
  ) {
    let devices
    if (usersIds.length > 0) {
      devices = await deviceService.findAll(
        {
          user: { $in: usersIds }
        },
        {
          sort: { createdAt: -1 }
        }
      )
    } else if (Object.keys(filters).length > 0) {
      const users = await userService.findAll(filters, {
        select: '_id',
        limit: Number.MAX_SAFE_INTEGER
      })
      usersIds = users.results.map((user) => user._id)
      devices = await deviceService.findAll(
        {
          user: { $in: usersIds }
        },
        {
          sort: { createdAt: -1 }
        }
      )
    } else {
      const users = await userService.findAll(
        {},
        {
          select: '_id',
          limit: Number.MAX_SAFE_INTEGER
        }
      )
      usersIds = users.results.map((user) => user._id)
      devices = await deviceService.findAll(
        {
          user: { $exists: true }
        },
        {
          sort: { createdAt: -1 }
        }
      )
    }
    const notificationPromises = usersIds.map(async (userId) => {
      const notification = await notificationsService.create(
        {
          type,
          ...notificationData,
          user: String(userId),
          read: false
        },
        {
          actor: getActorData()
        }
      )
      return notification
    })
    const promises = devices.results.map(async (device) => {
      if (device.fcmToken) {
        await this.sendPushNotification(
          device.fcmToken,
          {
            ...notificationData,
            type
          },
          device.user.toString()
        )
      }
    })
    await Promise.all(notificationPromises)
    await Promise.all(promises)
    return
  }

  async sendPushNotificationToUser<T extends keyof NotificationToPayloadMap>(
    type: T,
    {
      userId,
      notificationData
    }: {
      userId: string
      notificationData: Omit<CreateNotificationDto<T>, 'user' | 'read' | 'type'>
    }
  ) {
    const devices = await deviceService.findAll(
      {
        user: userId
      },
      {
        sort: { createdAt: -1 }
      }
    )
    const promises = devices.results.map(async (device) => {
      if (device.fcmToken) {
        await this.sendPushNotification(
          device.fcmToken,
          {
            ...notificationData,
            type
          },
          userId
        )
      }
    })
    await notificationsService.create(
      {
        type,
        ...notificationData,
        user: String(userId),
        read: false
      },
      {
        actor: getActorData()
      }
    )
    await Promise.all(promises)
    return
  }
  async sendPushNotification(
    pushToken: string,
    notificationData: Omit<CreateNotificationDto, 'user' | 'read'>,
    userId: string
  ) {
    try {
      await firebaseAdmin.messaging().send({
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          imageUrl: notificationData.image
        },
        data: {
          ...notificationData.payload,
          type: notificationData.type
        },
        token: pushToken
      })
    } catch (error: any) {
      loggerService.error(error?.message)
      // Check for expired or invalid token errors
      if (
        error?.code === 'messaging/invalid-argument' ||
        error?.code === 'messaging/registration-token-not-registered' ||
        error?.code === 'messaging/unregistered' ||
        error?.message?.includes('UNREGISTERED') ||
        error?.message?.includes('INVALID_ARGUMENT')
      ) {
        loggerService.info(
          `Removing the device: ${pushToken} for user: ${userId}`
        )
        // Remove the expired token from your database
        await this.removeExpiredToken(pushToken, userId)
      }
    }
  }
}

export const notificationDeviceCombinedService =
  new NotificationDeviceCombinedService()
