import { CreateBlogDto, IBlogDocument } from '@contracts'
import { BlogModel } from '@models'

import { BaseService } from './base.service'

class BlogService extends BaseService<IBlogDocument, CreateBlogDto> {
  constructor() {
    super(BlogModel)
  }
}

export const blogService = new BlogService()
