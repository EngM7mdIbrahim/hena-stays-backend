import { CreateUserViewPostsDto, IUserViewPostsDocument } from '@contracts'
import { UserViewPostsModel } from '@models'

import { BaseService } from './base.service'

export class UserViewPostsService extends BaseService<
  IUserViewPostsDocument,
  CreateUserViewPostsDto
> {
  constructor() {
    super(UserViewPostsModel)
  }
}

export const userViewPostsService = new UserViewPostsService()
