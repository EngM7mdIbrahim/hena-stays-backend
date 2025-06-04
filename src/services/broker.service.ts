import { CreateBrokerDto, IBrokerDocument } from '@contracts'
import { BrokerModel } from '@models'

import { BaseService } from './base.service'

class BrokerService extends BaseService<IBrokerDocument, CreateBrokerDto> {
  constructor() {
    super(BrokerModel)
  }
}

export const brokerService = new BrokerService()
