export function checkValueInEnum<T>(value: T, enumValues: Array<T>) {
  return enumValues.includes(value)
}
