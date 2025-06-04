import { DEFAULT_CATEGORIES, DEFAULT_SUBCATEGORIES } from '@constants'
import { ICategoryDocument } from '@contracts'
import { categoryService, loggerService, subCategoryService } from '@services'

import { getActorData } from '@utils'

/**
 * Create default categories if they don't exist
 * @returns Array of processed categories with IDs
 */
export async function createDefaultCategories() {
  try {
    for (const category of DEFAULT_CATEGORIES) {
      // Check if the category exists in the database
      const existingCategory = await categoryService.readOne({
        code: category.code
      })

      if (existingCategory) {
        // Add the ID to the processed category
        category._id = existingCategory._id.toString()
      } else {
        // If it doesn't exist, create it
        const newCategory = await categoryService.create(
          {
            name: category.name,
            code: category.code
          },
          { actor: getActorData() }
        )

        // Add the ID to the processed category
        category._id = newCategory._id.toString()
      }
    }
  } catch (error) {
    loggerService.error('Error creating default categories')
    throw error
  }
}

/**
 * Create default subcategories if they don't exist
 * @returns Array of processed subcategories with IDs
 */
export async function createDefaultSubCategories() {
  try {
    // First, get all categories to map their codes to IDs
    const { results: categories } = await categoryService.findAll({})
    const categoryCodeToId = new Map(
      categories.map((cat: ICategoryDocument) => [cat.code, cat._id.toString()])
    )

    for (const subCategory of DEFAULT_SUBCATEGORIES) {
      // Get the category ID from the code
      const categoryId = categoryCodeToId.get(subCategory.categoryCode)
      if (!categoryId) {
        loggerService.error(
          `Category not found for code: ${subCategory.categoryCode}`
        )
        continue
      }

      // Check if the subcategory exists in the database
      const existingSubCategory = await subCategoryService.readOne({
        code: subCategory.code
      })

      if (existingSubCategory) {
        // Add the ID to the processed subcategory
        subCategory._id = existingSubCategory._id.toString()
        subCategory.category = categoryId
      } else {
        // If it doesn't exist, create it
        const newSubCategory = await subCategoryService.create(
          {
            name: subCategory.name,
            code: subCategory.code,
            category: categoryId,
            sortOrder: subCategory.sortOrder
          },
          { actor: getActorData() }
        )

        // Add the ID to the processed subcategory
        subCategory._id = newSubCategory._id.toString()
        subCategory.category = categoryId
      }
    }
  } catch (error) {
    loggerService.error('Error creating default subcategories')
    throw error
  }
}
