import { CategoriesCodes, SubCategoriesCodes } from '@commonTypes'
import { CreateCategoryDto, CreateSubCategoryDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { getKeyFromText } from 'scripts/filters/common/get-key-from-text'
import { OldCategory } from 'scripts/interfaces-v1/category.interface-v1'

import { categoryCodeMapper, subCategoryCodeMapper } from '../filters/mappers'

const categoryDBInstances: Record<
  keyof typeof categoryCodeMapper,
  | (CreateCategoryDto & {
      _id: Types.ObjectId
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    })
  | null
> = {
  commercial: null,
  residential: null
}

export const categoryMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: string) => void
) => {
  let insertedCategories = 0
  let insertedSubCategories = 0
  const targetCategoryModel = targetDB?.collection('categories')
  const targetSubCategoryModel = targetDB?.collection('subcategories')
  const sourceCategoryModel = sourceDB?.collection('categories')

  const sourceCategories = ((await sourceCategoryModel.find({}).toArray()) ??
    []) as OldCategory[]
  for (const category of sourceCategories) {
    const categoryKey = getKeyFromText(category.type)
    let parentCategoryId = null
    if (!categoryDBInstances[categoryKey as keyof typeof categoryCodeMapper]) {
      logger(`Creating category ${category.type} in the database`)
      const newCategory: CreateCategoryDto & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
      } = {
        _id: category.id,
        name: category.type,
        code: categoryCodeMapper[
          categoryKey as keyof typeof categoryCodeMapper
        ],
        deletedAt: category.deleted ? new Date() : null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
      await targetCategoryModel.insertOne(newCategory)
      categoryDBInstances[categoryKey as keyof typeof categoryCodeMapper] =
        newCategory
      parentCategoryId = newCategory._id
      insertedCategories++
    } else {
      parentCategoryId =
        categoryDBInstances[categoryKey as keyof typeof categoryCodeMapper]!._id
    }
    const subCategoryKey = getKeyFromText(category.name)
    const newSubCategory: Omit<CreateSubCategoryDto, 'category'> & {
      _id: Types.ObjectId
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
      category: Types.ObjectId
    } = {
      _id: category.id,
      name: category.name,
      code: subCategoryCodeMapper[
        subCategoryKey as keyof typeof subCategoryCodeMapper
      ],
      category: parentCategoryId,
      sortOrder: category.order,
      deletedAt: category.deleted ? new Date() : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
    logger(`Inserting sub category: ${category._id}`)
    await targetSubCategoryModel.insertOne(newSubCategory)
    insertedSubCategories++
  }
  logger('Finished categories migrations')
  logger(`Inserted ${insertedCategories} categories`)
  logger(`Inserted ${insertedSubCategories} sub categories`)
}
