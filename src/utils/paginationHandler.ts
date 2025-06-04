import { PaginationQuery } from '@commonTypes'
import { RootFilterQuery, SortOrder } from 'mongoose'

import { buildFilters } from './buildFilter'

const processSortValue = (value: any): SortOrder => {
  const numberValue = Number(value)
  return numberValue === 1 || numberValue === -1 ? numberValue : -1
}

const buildSortQuery = (
  obj: any,
  parentKey: string = ''
): Record<string, SortOrder> => {
  if (typeof obj !== 'object' || obj === null) {
    return { [parentKey]: processSortValue(obj) }
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const currentKey = parentKey ? `${parentKey}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      return { ...acc, ...buildSortQuery(value, currentKey) }
    }

    return { ...acc, [currentKey]: processSortValue(value) }
  }, {})
}

export function getPaginationData<T>(query: PaginationQuery<T>) {
  const { page, limit, sort } = query
  const pageNumber = Number(page) || 1
  let limitNumber = Number(limit) || 10

  if (limitNumber > 100) {
    limitNumber = 100
  }
  if (limitNumber < 1) {
    limitNumber = 1
  }
  let filter: RootFilterQuery<T> = {}
  if (query.filter) {
    filter = {
      ...buildFilters<T>(query.filter)
    }
  }
  if (query.text) {
    filter['$text'] = { $search: query.text, $caseSensitive: false }
  }
  // Main sort handling
  const sortQuery = sort ? buildSortQuery(sort) : { createdAt: -1 as SortOrder }
  return { limit: limitNumber, page: pageNumber, sort: sortQuery, filter }
}
