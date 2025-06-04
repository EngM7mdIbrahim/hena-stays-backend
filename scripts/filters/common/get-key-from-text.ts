export const getKeyFromText = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('.', '')
    .replaceAll(',', '')
    .replaceAll('!', '')
    .replaceAll('?', '')
    .replaceAll('&', '')
    .replaceAll('*', '')
    .replaceAll('/', '')
    .replaceAll('\\', '')
    .replaceAll('"', '')
}
