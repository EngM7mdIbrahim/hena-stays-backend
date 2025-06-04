import {
  CreateProfileInteractionsDto,
  IProfileInteractionsDocument
} from '@contracts'
import { ProfileInteractionsModel } from '@models'

import { BaseService } from './base.service'

export class ProfileInteractionsService extends BaseService<
  IProfileInteractionsDocument,
  CreateProfileInteractionsDto
> {
  constructor() {
    super(ProfileInteractionsModel)
  }
}

export const profileInteractionsService = new ProfileInteractionsService()
