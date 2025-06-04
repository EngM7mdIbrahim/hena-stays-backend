import {
  CreateUserViewProjectsDto,
  IUserViewProjectsDocument
} from '@contracts'
import { UserViewProjectsModel } from '@models'

import { BaseService } from './base.service'

class UserViewProjectsService extends BaseService<
  IUserViewProjectsDocument,
  CreateUserViewProjectsDto
> {
  constructor() {
    super(UserViewProjectsModel)
  }
}

export const userViewProjectsService = new UserViewProjectsService()
