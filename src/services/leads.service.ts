import { CreateLeadsDto, ILeadsDocument } from '@contracts'
import { LeadsModel } from '@models'

import { BaseService } from './base.service'

class LeadsService extends BaseService<ILeadsDocument, CreateLeadsDto> {
  constructor() {
    super(LeadsModel)
  }
}

export const leadsService = new LeadsService()
