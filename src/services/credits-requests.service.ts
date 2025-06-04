import { CreditRequestStatus } from '@commonTypes'
import {
  CreateCreditsRequestDto,
  CreateExtraConfig,
  ICreditsRequestDocument
} from '@contracts'
import { CreditsRequestModel } from '@models'

import { BaseService } from './base.service'

class CreditsRequestsService extends BaseService<
  ICreditsRequestDocument,
  CreateCreditsRequestDto
> {
  constructor() {
    super(CreditsRequestModel)
  }

  async createRequest(
    item: Pick<CreateCreditsRequestDto, 'credits' | 'user' | 'media'>,
    extraConfig: CreateExtraConfig,
    creditsPrice: number
  ) {
    const { credits } = item
    const fees = credits * creditsPrice
    return await super.create(
      {
        ...item,
        fees,
        status: CreditRequestStatus.Pending
      },
      extraConfig
    )
  }
}

export const creditsRequestsService = new CreditsRequestsService()
