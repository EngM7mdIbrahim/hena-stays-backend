import {
  CreateRequestBuyPropertyDto,
  IRequestBuyPropertyDocument
} from '@contracts'
import { RequestBuyPropertyModel } from '@models'

import { BaseService } from './base.service'

class RequestBuyPropertyService extends BaseService<
  IRequestBuyPropertyDocument,
  CreateRequestBuyPropertyDto
> {
  constructor() {
    super(RequestBuyPropertyModel)
  }
}

export const requestBuyPropertyService = new RequestBuyPropertyService()
