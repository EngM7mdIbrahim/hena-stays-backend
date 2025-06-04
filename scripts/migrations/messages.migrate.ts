import { MediaTypes } from '@commonTypes'
import { CreateMessageDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldMessage } from 'scripts/interfaces-v1'

export const messagesMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedMessages: OldMessage[] = []
  let insertedMessages: number = 0
  try {
    const sourceMessageModel = sourceDB?.collection('messages')
    const targetMessageModel = targetDB?.collection('messages')
    const targetChatModel = targetDB?.collection('chats')
    const targetUserModel = targetDB?.collection('users')

    const sourceMessages = await sourceMessageModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    for (let index = 0; index < sourceMessages.length; index++) {
      const message = sourceMessages[index]
      const messageWithType: OldMessage = message as unknown as OldMessage

      // Check if sender exists
      const sender = await targetUserModel?.findOne({
        _id: messageWithType.sender
      })
      if (!sender) {
        logger(
          `Skipping message ${messageWithType._id} - sender not found with id: ${messageWithType.sender}`
        )
        passedMessages.push(messageWithType)
        continue
      }
      // Check if chat exists
      const chat = await targetChatModel?.findOne({ _id: messageWithType.chat })
      if (!chat) {
        logger(
          `Skipping message ${messageWithType._id} - chat not found with id: ${messageWithType.chat}`
        )
        passedMessages.push(messageWithType)
        continue
      }
      logger(`Inserting message: ${messageWithType._id}`)
      const newMessage: Omit<CreateMessageDto, 'sender' | 'chat'> & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
        sender: Types.ObjectId
        chat: Types.ObjectId
      } = {
        _id: new Types.ObjectId(messageWithType._id.toString()),
        createdAt: messageWithType.createdAt,
        updatedAt: messageWithType.updatedAt,
        sender: messageWithType.sender,
        chat: messageWithType.chat,
        text: messageWithType.text,
        media: messageWithType.images.map((image) => ({
          _id: new Types.ObjectId(image.toString()),
          url: image,
          type: MediaTypes.Image
        })),
        deletedAt: messageWithType.deleted ? new Date() : null,
        readBy: []
      }
      await targetMessageModel?.insertOne(newMessage)
      insertedMessages++
    }

    logger('Message migration completed')
    logger(`There are ${insertedMessages} messages inserted`)
    if (passedMessages.length > 0) {
      logger(`There are ${passedMessages.length} messages passed`)
      logger(passedMessages)
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
