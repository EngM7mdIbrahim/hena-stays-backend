import {
  CreateCategoryDto,
  DeleteExtraConfig,
  ICategoryDocument
} from '@contracts'
import { CategoryModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'
import { subCategoryService } from './subCategory.service'

class CategoryService extends BaseService<
  ICategoryDocument,
  CreateCategoryDto
> {
  constructor() {
    super(CategoryModel)
  }
  override async delete(
    filter: FilterQuery<ICategoryDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    const subCategories = await subCategoryService.findAll(
      {
        category: filter._id
      },
      {
        select: '_id'
      }
    )
    await subCategoryService.deleteMany(
      {
        _id: { $in: subCategories.results.map((item) => item._id) }
      },
      extraConfig
    )
    return await super.delete(filter, extraConfig)
  }
}

export const categoryService = new CategoryService()
