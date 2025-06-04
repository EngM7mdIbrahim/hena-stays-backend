import { CreateLikeDto, ILikeDocument } from '@contracts'
import { LikeModel } from '@models'

import { BaseService } from './base.service'

class LikeService extends BaseService<ILikeDocument, CreateLikeDto> {
  constructor() {
    super(LikeModel)
  }
}

export const likeService = new LikeService()
