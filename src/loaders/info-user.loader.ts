import { randomUUID } from 'crypto'
import { UserRole } from '@commonTypes'
import { DEFAULT_USER_SUPPORT_INFO } from '@constants'
import { loggerService, userService } from '@services'

import { getActorData, imageUploader } from '@utils'

export const checkAndLoadDefaultSupportUser = async () => {
  loggerService.info('Checking if default support user exists')
  const user = await userService.readOne({
    email: DEFAULT_USER_SUPPORT_INFO.email
  })

  if (!user) {
    loggerService.info('Default support user not found, creating user ...')
    loggerService.info('Uploading profile image ...')
    const imageUploadResponse = await imageUploader('src/assets/logo.png')
    loggerService.info('Creating user ...')

    const createdUser = await userService.create(
      {
        ...DEFAULT_USER_SUPPORT_INFO,
        role: UserRole.Support,
        username: DEFAULT_USER_SUPPORT_INFO.email,
        password: randomUUID(),
        image: imageUploadResponse.url
      },
      {
        actor: getActorData()
      }
    )
    loggerService.info(
      `Created default support user with id: ${createdUser._id}`
    )
  } else {
    loggerService.info(`Found default support user with id: ${user._id}`)
  }
}
