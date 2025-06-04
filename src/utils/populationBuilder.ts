import { FieldsPop } from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { PopulateOptions } from 'mongoose'

function buildPopulate(
  fieldSplit: string[],
  basePopulate: PopulateOptions[],
  fieldsPop: any
) {
  const [current, ...rest] = fieldSplit
  let baseObject = basePopulate.find((p) => p.path === current)
  if (!baseObject) {
    baseObject = { path: current!, populate: [] }
    basePopulate.push(baseObject)
  }

  if (rest.length > 0) {
    buildPopulate(
      rest,
      baseObject.populate as PopulateOptions[],
      fieldsPop?.[rest[0]!]
    )
  } else if (typeof fieldsPop?.[current!] === 'object') {
    for (const key in fieldsPop?.[current!]) {
      buildPopulate(
        [key],
        baseObject.populate as PopulateOptions[],
        fieldsPop[key]
      )
    }
  } else if (fieldsPop?.[current!] === 'true') {
    baseObject.populate = undefined
  }
}

export function populationBuilder<T>(
  fieldsPop?: FieldsPop<T>
): PopulateOptions[] {
  const populate: PopulateOptions[] = []

  if (!fieldsPop) return populate

  function processFieldsPop(
    fieldsPop: any,
    basePath: string[] = [],
    depth: number = 0
  ) {
    if (depth > 3)
      throw new AppError(MESSAGES.SECURITY.TOO_MANY_NESTED_FIELDS, 400)
    for (const key in fieldsPop) {
      if (typeof fieldsPop[key] === 'object' && fieldsPop[key] !== null) {
        processFieldsPop(fieldsPop[key], [...basePath, key], depth + 1)
      } else {
        buildPopulate([...basePath, key], populate, fieldsPop)
      }
    }
  }

  processFieldsPop(fieldsPop)

  return populate
}
