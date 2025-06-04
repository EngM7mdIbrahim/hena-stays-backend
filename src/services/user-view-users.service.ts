import { CreateUserViewUsersDto, IUserViewUsersDocument } from '@contracts'
import { UserViewUsersModel } from '@models'

import { BaseService } from './base.service'

export class UserViewUsersService extends BaseService<
  IUserViewUsersDocument,
  CreateUserViewUsersDto
> {
  constructor() {
    super(UserViewUsersModel)
  }
}

export const userViewUsersService = new UserViewUsersService()
