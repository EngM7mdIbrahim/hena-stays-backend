export const checkString = (value: any) => {
  return typeof value === 'string' || typeof value === 'number'
    ? `${value}`.trim() !== ''
    : false
}
