export const getPreferredUriScheme = (domain: string) => {
  // checks for localIP adddresses and localhost
  if (
    /^(127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|localhost)(:\d+)?$/.test(
      domain
    )
  ) {
    return 'http'
  }
  return 'https'
}
