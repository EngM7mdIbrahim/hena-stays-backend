export const SOCKET_ROOMS = {
  // Room prefixes
  CHAT_PREFIX: 'chat:'
} as const

export const SOCKET_ERROR_MESSAGES = {
  CHAT_NOT_FOUND: 'Chat not found or unauthorized',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_DATA: 'Invalid data provided'
} as const
