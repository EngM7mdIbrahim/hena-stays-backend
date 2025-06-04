import { Difference } from '@contracts'

export const logDifferences = <T extends Record<string, unknown>>(
  before: T,
  after: T
): string => {
  const findDifferences = (
    beforeObj: T,
    afterObj: T
  ): Difference<T> | undefined => {
    const changes: Difference<T> = {}

    for (const key in afterObj) {
      if (key === '_id') continue
      if (Object.prototype.hasOwnProperty.call(afterObj, key)) {
        const beforeValue = beforeObj[key]
        const afterValue = afterObj[key]

        if (
          typeof beforeValue === 'object' &&
          typeof afterValue === 'object' &&
          beforeValue &&
          afterValue
        ) {
          const nestedDiffs = findDifferences(
            beforeValue as Record<string, unknown> as T,
            afterValue as Record<string, unknown> as T
          )
          if (nestedDiffs && Object.keys(nestedDiffs).length > 0) {
            changes[key as keyof T] = nestedDiffs as Difference<T>[keyof T]
          }
        } else if (beforeValue !== afterValue) {
          changes[key as keyof T] = {
            before: beforeValue,
            after: afterValue
          } as Difference<T>[keyof T]
        }
      }
    }

    return Object.keys(changes).length > 0 ? changes : undefined
  }

  const differences = findDifferences(before, after)

  if (!differences) return ''

  const formatDifferences = (diffs: Difference<T>, parentKey = ''): string => {
    return Object.keys(diffs)
      .map((key) => {
        const diff = diffs[key] as
          | { before: unknown; after: unknown }
          | Difference<T>
        const fullKey = parentKey ? `${parentKey}.${key}` : key

        if (typeof diff === 'object' && 'before' in diff && 'after' in diff) {
          return `Field "${fullKey}" changed from "${diff.before}" to "${diff.after}"`
        } else {
          return formatDifferences(diff as Difference<T>, fullKey)
        }
      })
      .join('\n')
  }

  const result = formatDifferences(differences)
  return result
}
