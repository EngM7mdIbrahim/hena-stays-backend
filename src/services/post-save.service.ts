import { CreatePostSaveDto, IPostSaveDocument } from '@contracts'
import { PostSaveModel } from '@models'

import { BaseService } from './base.service'

class PostSaveService extends BaseService<
  IPostSaveDocument,
  CreatePostSaveDto
> {
  constructor() {
    super(PostSaveModel)
  }
}

export const postSaveService = new PostSaveService()
