export function invalid(name: string) {
  return `${name} is invalid`
}

export function notFound(name: string) {
  return `${name} not found`
}

export function alreadyExists(name: string) {
  return `${name} already exists`
}

export function failed(name: string) {
  return `${name} failed`
}

export function required(name: string) {
  return `${name} is required`
}

export function missingData(...names: string[]) {
  return `Missing data: ${names.join(', ')}`
}

export const SECURITY = {
  TOO_MANY_NESTED_FIELDS: 'Denied, too many nested fields for the population',
  NOT_FROM_COMBINED_SERVICE:
    'Please use the delete method from the combined service'
}

export const AUTH = {
  INVALID_ROLE: invalid('Role'),
  USERNAME_EXISTS: 'Username already exists',
  INVALID_CREDENTIALS: invalid('Email or password'),
  EXPIRED_TOKEN: 'Your token has expired!',
  NOT_VERIFIED: 'Your email is not verified. Please verify your email.',
  PASSWORD_MISMATCH: 'password and confirm password do not match',
  ALREADY_VERIFIED: 'Your email is already verified',
  INVALID_OTP: 'Invalid OTP. Please try again',
  OTP_EXPIRED: 'OTP expired. Please try again',
  BLOCKED: 'Your account has been blocked. Please contact support',
  USER_EXISTS: 'User already exists',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  BAD_TOKEN: 'Invalid token, please login again',
  NO_TOKEN_PROVIDED: 'No token provided',
  RESET_LINK_SENT: 'Reset link sent successfully',
  INVALID_TOKEN: 'Invalid token',
  PASSWORD_RESET: 'Password reset successfully',
  RESTRICTION_MESSAGE: "You don't have permission to perform this action",
  COMPANY_REQUIRED: 'Company is required',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  LOGGED_OUT: 'Logged out successfully'
}

export const GENERAL_ERROR = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  MISSING_DATA: 'Missing data'
}

export const IMAGES = {
  NO_FILE: 'No file uploaded',
  INVALID_FORMAT: invalid('Image format'),
  INVALID_SIZE: invalid('Image size'),
  INVALID_DIMENSION: invalid('Image dimension'),
  FAILED_UPLOAD: failed('Uploading image')
}

export const USER = {
  NOT_FOUND: notFound('User')
}

export const MEDIA = {
  REQUIRED: 'Media is required',
  NO_FILE: 'No file uploaded',
  INVALID_FORMAT: invalid('Media format'),
  INVALID_SIZE: invalid('Media size'),
  INVALID_DIMENSION: invalid('Media dimension'),
  FAILED_UPLOAD: failed('Uploading media')
}

export const POSTS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Post'),
  CREATE_FAILED: failed('Creating post'),
  UPDATE_FAILED: failed('Updating post'),
  DELETE_FAILED: failed('Deleting post'),
  LIKE_FAILED: failed('Liking post'),
  UNLIKE_FAILED: failed('Unliking post'),
  SAVE_FAILED: failed('Saving post'),
  UNSAVE_FAILED: failed('Unsaving post'),
  COMMENT_FAILED: failed('Commenting on post'),
  ALREADY_DELETED: 'Post already deleted'
}

export const COMMENTS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Comment'),
  CREATE_FAILED: failed('Creating comment'),
  UPDATE_FAILED: failed('Updating comment'),
  DELETE_FAILED: failed('Deleting comment'),
  ALREADY_DELETED: 'Comment already deleted'
}

export const SAVES = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Save'),
  ALREADY_SAVED: 'Post already saved',
  ALREADY_UNSAVED: 'Post already unsaved'
}

export const LIKES = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Like'),
  ALREADY_LIKED: 'Post already liked',
  ALREADY_UNLIKED: 'Post already unliked',
  UNSUPPORTED_TYPE: 'Unsupported entity type',
  ONE_TYPE_ONLY: 'You can only like or unlike one entity at a time'
}

export const FOLLOWS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Follow'),
  ALREADY_FOLLOWED: 'User already followed',
  ALREADY_UNFOLLOWED: 'User already unfollowed',
  SELF_FOLLOW: "You can't follow yourself",
  INVALID_TO_FOLLOW: 'You cannot follow this user',
  USER_FOLLOW: 'You cannot follow this user'
}

export const BLOGS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Blog'),
  CREATE_FAILED: failed('Creating blog'),
  UPDATE_FAILED: failed('Updating blog'),
  DELETE_FAILED: failed('Deleting blog')
}

export const PROPERTY_XML = {
  NOT_AUTH_TO_IMPORT:
    'You are not authorized to import properties, please contact your company admin or company owner',
  URL_EXISTS_WITH_ANOTHER_USER:
    'This URL is already registered in the system with another user.',
  URL_EXISTS: 'This URL is already registered in the system.'
}

export const CATEGORIES = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Category'),
  CREATE_FAILED: failed('Creating category'),
  UPDATE_FAILED: failed('Updating category'),
  DELETE_FAILED: failed('Deleting category')
}

export const SUB_CATEGORIES = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('SubCategory'),
  CREATE_FAILED: failed('Creating subcategory'),
  UPDATE_FAILED: failed('Updating subcategory'),
  DELETE_FAILED: failed('Deleting subcategory'),
  NOT_BELONGS_TO_CATEGORY: 'SubCategory does not belong to this category'
}

export const PROPERTIES = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Property'),
  CREATE_FAILED: failed('Creating property'),
  UPDATE_FAILED: failed('Updating property'),
  DELETE_FAILED: failed('Deleting property'),
  DURATION_REQUIRED: 'Duration is required for rent properties',
  TRAKHESSI_REQUIRED: 'Tarkheesi is required for Dubai properties',
  RECOMMENDED_PROPERTIES_NOT_FOUND: (propertyIds: string[]) =>
    `Properties with ids ${propertyIds.join(', ')} not found or already recommended`
}

export const PROJECTS = {
  FULL_PRICE_OR_PROJECT_COMPLETION_REQUIRED:
    'Either full price or project completion is required, but you cannot provide both.',
  TOTAL_PERCENTAGE: 'Total payment percentages should be equal to 100%',
  UNITS_REQUIRED:
    'Units are required to update project status, add properties first'
}

export const CALL_REQUESTS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Call request'),
  CREATE_FAILED: failed('Creating call request'),
  UPDATE_FAILED: failed('Updating call request'),
  DELETE_FAILED: failed('Deleting call request'),
  ALREADY_DELETED: 'Call request already deleted'
}

export function MinimumGreaterThanMaximum(field: string) {
  return `Minimum ${field} cannot be greater than maximum ${field}`
}

export const CHATS = {
  MISSING_ID: missingData('id'),
  NOT_FOUND: notFound('Chat'),
  CANNOT_CHAT_WITH_SELF: "You can't chat with yourself",
  NO_PARTICIPANTS: 'No participants found',
  NOT_SUPPORT_CHAT_NOT_ALLOWED:
    'You are a support agent, then support chats should be sent!'
}

export const NOTIFICATIONS = {
  newFollow: (name: string) => `${name} followed you`,
  checkNew: (entity: string) => `There's a new ${entity}, check it out!`,
  newComment: (name: string) => `${name} commented on your post`,
  newPostLike: (name: string) => `${name} liked your post`,
  newCommentLike: (name: string) => `${name} liked your comment`,
  AllNotificationsDeleted: 'All notifications deleted'
}
//' not found'
export const SCHEDULER = {
  MISSING_TOKEN: notFound('Scheduler Token'),
  INVALID_TOKEN: invalid('Scheduler Token')
}

export const CONFIG = {
  CREATION_ERROR: "You can't create more than one config"
}

export const SUBSCRIPTIONS = {
  INSUFFICIENT_CREDITS: 'Insufficient credits'
}
