import { CreateSubCategoryDto, ISubCategoryDocument } from '@contracts'
import { SubCategoryModel } from '@models'

import { BaseService } from './base.service'

class SubCategoryService extends BaseService<
  ISubCategoryDocument,
  CreateSubCategoryDto
> {
  constructor() {
    super(SubCategoryModel)
  }
}

export const subCategoryService = new SubCategoryService()
