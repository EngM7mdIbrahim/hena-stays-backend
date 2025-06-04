import {
  ActionToTakeTypes,
  CountUnreadNotificationsResponse,
  DeleteAllNotificationsResponse,
  DeleteNotificationRequestParams,
  DeleteNotificationResponse,
  GetAllNotificationsQuery,
  GetAllNotificationsResponse,
  GetOneNotificationParams,
  GetOneNotificationQuery,
  GetOneNotificationResponse,
  Notification
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { notificationsService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class NotificationsController {
  async getAll(
    req: Request<any, any, any, GetAllNotificationsQuery>,
    res: Response<GetAllNotificationsResponse>
  ) {
    const { limit, page, sort } = getPaginationData(req.query)
    const notifications = await notificationsService.findAll(
      {
        user: getLoggedInUserId(req)
      },
      {
        limit,
        page,
        sort: {
          ...sort,
          read: 1
        }
      }
    )

    return sendSuccessResponse(res, {
      items: notifications.results.map((notification) =>
        serializeDto<Notification>(notification)
      ),
      total: notifications.totalResults,
      limit,
      page,
      totalPages: notifications.totalPages,
      nextPage: page < notifications.totalPages ? page + 1 : undefined,
      hasNext: page < notifications.totalPages
    })

    const updatedNotifications = notifications.results.map(
      async (notification) => {
        notification.read = true
        return notification.save()
      }
    )

    await Promise.all(updatedNotifications)
    return
  }
  async getOne(
    req: Request<GetOneNotificationParams, any, any, GetOneNotificationQuery>,
    res: Response<GetOneNotificationResponse>
  ) {
    const notification = await notificationsService.readOne(
      {
        _id: req.params.id,
        user: getLoggedInUserId(req)
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    return sendSuccessResponse(res, {
      notification: serializeDto<Notification>(notification!)
    })
  }

  async deleteNotification(
    req: Request<DeleteNotificationRequestParams>,
    res: Response<DeleteNotificationResponse>
  ) {
    const notification = await notificationsService.readOne(
      {
        _id: req.params.id,
        user: getLoggedInUserId(req)
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const lastNotification = await notificationsService.delete(
      { _id: notification!._id },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(res, {
      notification: serializeDto<Notification>(lastNotification!)
    })
  }

  async deleteAll(req: Request, res: Response<DeleteAllNotificationsResponse>) {
    await notificationsService.deleteMany(
      {
        user: getLoggedInUserId(req)
      },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(res, {
      msg: MESSAGES.NOTIFICATIONS.AllNotificationsDeleted
    })
  }

  async countUnread(
    req: Request,
    res: Response<CountUnreadNotificationsResponse>
  ) {
    if (!req.user) {
      throw new Error(MESSAGES.AUTH.UNAUTHORIZED)
    }
    const count = await notificationsService.count({
      filter: {
        user: getLoggedInUserId(req),
        read: false
      }
    })
    return sendSuccessResponse(res, { count })
  }
}

export const notificationsController = new NotificationsController()
