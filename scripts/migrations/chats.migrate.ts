import { ChatTypes, UserRole } from '@commonTypes'
import { CreateChatDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldChat, OldLikes } from 'scripts/interfaces-v1'

export const checkForMissingSupportUserIds = (
  supportUserIds: Types.ObjectId[],
  chat: OldChat,
  logger: (message: any) => void
) => {
  const finalUsers = chat.users
  if (chat.support) {
    const supportUserIdsString = supportUserIds.map((id) => id.toString())
    let chatUserIdsString = finalUsers.map((id) => id.toString())
    for (const supportUserId of supportUserIdsString) {
      if (!chatUserIdsString.includes(supportUserId)) {
        logger(
          `Chat ${chat._id} has missing support user id: ${supportUserId}, adding it to the chat`
        )
        finalUsers.push(new Types.ObjectId(supportUserId))
        chatUserIdsString.push(supportUserId)
      }
    }
  }
  return finalUsers
}

export const chatsMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedChats: OldChat[] = []
  let insertedChats: number = 0
  try {
    const sourceChatModel = sourceDB?.collection('chats')
    const targetChatModel = targetDB?.collection('chats')
    const targetUserModel = targetDB?.collection('users')

    const sourceChats = await sourceChatModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    for (let index = 0; index < sourceChats.length; index++) {
      const chat = sourceChats[index]
      const chatWithType: OldChat = chat as unknown as OldChat

      // Check if user exists
      for (const userId of chatWithType.users) {
        const user = await targetUserModel?.findOne({ _id: userId })
        if (!user) {
          logger(
            `Skipping chat ${chatWithType._id} - One of the users not found with id: ${userId}`
          )
          passedChats.push(chatWithType)
          continue
        }
      }
      const allSupportUserIds = (
        (await targetUserModel
          ?.find({
            type: {
              $in: [UserRole.Admin, UserRole.AdminViewer, UserRole.Support]
            }
          })
          .toArray()) ?? []
      ).map((user) => user._id)
      logger(`Inserting chat: ${chatWithType._id}`)
      const newChat: Omit<CreateChatDto, 'users'> & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
        users: Types.ObjectId[]
      } = {
        _id: new Types.ObjectId(chatWithType._id.toString()),
        users: checkForMissingSupportUserIds(
          allSupportUserIds,
          chatWithType,
          logger
        ),
        type: chatWithType.support ? ChatTypes.SUPPORT : ChatTypes.NORMAL,
        createdAt: chatWithType.createdAt,
        updatedAt: chatWithType.updatedAt,
        deletedAt: chatWithType.deleted ? new Date() : null
      }
      await targetChatModel?.insertOne(newChat)
      insertedChats++
    }

    logger('Chat migration completed')
    logger(`There are ${insertedChats} chats inserted`)
    if (passedChats.length > 0) {
      logger(`There are ${passedChats.length} chats passed`)
      logger(passedChats)
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
