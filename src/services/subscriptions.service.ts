import { CreateSubscriptionsDto, ISubscriptionsDocument } from '@contracts'
import { SubscriptionModel } from '@models'

import { BaseService } from './base.service'

class SubscriptionsService extends BaseService<
  ISubscriptionsDocument,
  CreateSubscriptionsDto
> {
  constructor() {
    super(SubscriptionModel)
  }
}

export const subscriptionsService = new SubscriptionsService()
