import { CreateFollowDto, IFollowDocument } from '@contracts'
import { FollowModel } from '@models'
import { BaseService } from '@services'

class FollowService extends BaseService<IFollowDocument, CreateFollowDto> {
  constructor() {
    super(FollowModel)
  }
}

export const followService = new FollowService()
