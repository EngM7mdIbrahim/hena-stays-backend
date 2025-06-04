import { Filter } from '@commonTypes'
import { RootFilterQuery } from 'mongoose'

function transformPathToString<T>(
  query: RootFilterQuery<T> = {},
  result: RootFilterQuery<T> = {},
  parentPath?: string
): RootFilterQuery<T> {
  for (const key in query) {
    const value = query[key as keyof typeof query]
    const field = key
    const nextPath = parentPath ? `${parentPath}.${field}` : field
    if (typeof value === 'object' && value !== null && '$elemMatch' in value) {
      result[nextPath as unknown as keyof typeof result] = {
        $elemMatch: transformPathToString(value['$elemMatch'] as any)
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !('$lte' in value) &&
      !('$gte' in value)
    ) {
      transformPathToString(value, result, nextPath)
    } else {
      result[nextPath as unknown as keyof typeof result] = value
    }
  }
  return result
}

function buildStageOneFilters<T>(filter: Filter<T>): RootFilterQuery<T> {
  const query: RootFilterQuery<T> = {}

  for (const key in filter) {
    const value = filter[key]

    const field = key

    if (
      // Handle array elements
      !Array.isArray(value) &&
      value &&
      typeof value === 'object' &&
      'elements' in value &&
      typeof value.elements === 'object' &&
      value.elements !== null
    ) {
      const elementQuery: any = {}
      const { elements } = value
      elementQuery.$elemMatch = buildStageOneFilters(elements) as any
      query[field] = elementQuery
    } else if (
      // Handle min/max for number or Date
      value &&
      typeof value === 'object' &&
      ('min' in value || 'max' in value)
    ) {
      const { min, max } = value as Filter<{ [currKey: string]: Date | number }>
      const rangeQuery: any = {}

      if (min !== undefined && !Number.isNaN(Number(min))) {
        rangeQuery.$gte = Number(min)
      }
      if (max !== undefined && !Number.isNaN(Number(max))) {
        rangeQuery.$lte = Number(max)
      }

      query[field] = rangeQuery
    } else if (
      // Handle nested objects
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null
    ) {
      query[field] = buildStageOneFilters(value as any) as any
    } else {
      // Handle simple values
      query[field] = value as any
    }
  }
  return query
}

export function buildFilters<T>(filter: Filter<T>): RootFilterQuery<T> {
  const stageOne = buildStageOneFilters(filter)
  const stageTwo = transformPathToString(stageOne)
  return stageTwo
}
