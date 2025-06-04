export function serializeExtended(data?: any) {
  if (typeof data?.toJSON === 'function') {
    return data.toJSON()
  }
  return data
}
