/**
 * Generates a random password of a specified length using
 * uppercase, lowercase letters, and digits.
 *
 * @param len - The length of the password to generate.
 * @returns A randomly generated password string.
 */
export const passwordGenerator = (len: number = 8): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < len; i++) {
    // Selects a random character from the characters string
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
