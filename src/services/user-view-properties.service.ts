import {
  CreateUserViewPropertiesDto,
  IUserViewPropertiesDocument
} from '@contracts'
import { UserViewPropertiesModel } from '@models'

import { BaseService } from './base.service'

class UserViewsPropertiesService extends BaseService<
  IUserViewPropertiesDocument,
  CreateUserViewPropertiesDto
> {
  constructor() {
    super(UserViewPropertiesModel)
  }
}

export const userViewsPropertiesService = new UserViewsPropertiesService()
