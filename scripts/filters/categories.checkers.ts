import {
  AmenitiesCodes,
  CategoriesCodes,
  SubCategoriesCodes
} from '@commonTypes'
import { Db } from 'mongodb'
import { OldCategory } from 'scripts/interfaces-v1/category.interface-v1'

import { checkIfUnique } from './common/check-if-unique'
import { getKeyFromText } from './common/get-key-from-text'
import { categoryCodeMapper, subCategoryCodeMapper } from './mappers'

const categoryCodeChecker: Record<keyof typeof categoryCodeMapper, boolean> = {
  commercial: false,
  residential: false
}

export const checkAllCategoriesExistInDb = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking order of categories...')
  await checkIfUnique<OldCategory>(
    sourceDB,
    'categories',
    'category',
    'order',
    logger
  )
  const categoriesInMapperNotInDb: string[] = []
  const categoriesInDbNotInMapper: string[] = []
  let subCategoriesEntries = Object.entries(subCategoryCodeMapper)
  logger('Checking if all categories exist in the database...')
  const categories = ((await sourceDB
    .collection('categories')
    .find({})
    .toArray()) ?? []) as OldCategory[]
  logger(`Found ${categories.length} categories in the database...`)
  logger('Checking if all categories exist in the database...')
  for (const category of categories) {
    const currentCategoryTypeAsKey = getKeyFromText(category.type)
    categoryCodeChecker[
      currentCategoryTypeAsKey as keyof typeof categoryCodeChecker
    ] = true
  }
  if (!Object.values(categoryCodeChecker).every(Boolean)) {
    throw new Error(
      `Categories not found in the database: ${Object.keys(categoryCodeChecker)
        .filter(
          (key) => !categoryCodeChecker[key as keyof typeof categoryCodeChecker]
        )
        .join(', ')}`
    )
  }
  logger('Checking if all subcategories exist in the database...')
  for (const category of categories) {
    const key = getKeyFromText(category.name)
    const code =
      subCategoryCodeMapper[key as keyof typeof subCategoryCodeMapper]
    if (!code) {
      categoriesInDbNotInMapper.push(category.name)
    } else {
      subCategoriesEntries = subCategoriesEntries.filter(
        ([currentKey, _]) => currentKey !== key
      )
    }
  }
  if (subCategoriesEntries.length > 0) {
    throw new Error(
      `Categories not found in the database: ${subCategoriesEntries
        .map(([key, code]) => `${key} (${code})`)
        .join(', ')}`
    )
  }
  if (categoriesInMapperNotInDb.length > 0) {
    throw new Error(
      `Categories not found in the database: ${categoriesInMapperNotInDb.join(
        ', '
      )}`
    )
  }
}
