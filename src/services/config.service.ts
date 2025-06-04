import { CreateConfigDto, IConfigDocument } from '@contracts'
import { ConfigModel } from '@models'

import { BaseService } from './base.service'

class ConfigsService extends BaseService<IConfigDocument, CreateConfigDto> {
  constructor() {
    super(ConfigModel)
  }
}

export const configsService = new ConfigsService()
