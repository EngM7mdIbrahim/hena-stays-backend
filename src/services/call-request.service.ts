import { CreateCallRequestDto, ICallRequestDocument } from '@contracts'
import { CallRequestModel } from '@models'

import { BaseService } from './base.service'

class CallRequestService extends BaseService<
  ICallRequestDocument,
  CreateCallRequestDto
> {
  constructor() {
    super(CallRequestModel)
  }
}

export const callRequestService = new CallRequestService()
