import {
  CreateRequestSellPropertyDto,
  IRequestSellPropertyDocument
} from '@contracts'
import { RequestSellPropertyModel } from '@models'

import { BaseService } from './base.service'

class RequestSellPropertyService extends BaseService<
  IRequestSellPropertyDocument,
  CreateRequestSellPropertyDto
> {
  constructor() {
    super(RequestSellPropertyModel)
  }
}

export const requestSellPropertyService = new RequestSellPropertyService()
