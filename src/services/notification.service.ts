import { CreateNotificationDto, INotificationDocument } from '@contracts'
import { NotificationModel } from '@models'

import { BaseService } from './base.service'

export class NotificationsService extends BaseService<
  INotificationDocument,
  CreateNotificationDto
> {
  constructor() {
    super(NotificationModel)
  }
}

export const notificationsService = new NotificationsService()
