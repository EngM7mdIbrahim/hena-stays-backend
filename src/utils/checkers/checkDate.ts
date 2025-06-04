export const checkDate = (value: string) => {
  return !Number.isNaN(Date.parse(value))
}
