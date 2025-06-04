import { Db } from 'mongodb'
import { OldMessage } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getMessagesWithNoChat = async (sourceDB: Db) => {
  const messagesMissingChat: OldMessage[] = []
  const messages = ((await sourceDB
    .collection('messages')
    .find({})
    .toArray()) ?? []) as OldMessage[]
  for (const message of messages) {
    const chat = await sourceDB
      .collection('chats')
      .findOne({ _id: message.chat })
    if (!chat) {
      messagesMissingChat.push(message)
    }
  }
  return messagesMissingChat
}

const getMessagesWithNoUser = async (
  sourceDB: Db,
  key: 'sender' | 'receiver'
) => {
  const messagesMissingUser: OldMessage[] = []
  const messages = ((await sourceDB
    .collection('messages')
    .find({})
    .toArray()) ?? []) as OldMessage[]
  for (const message of messages) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: message[key] })
    if (!user) {
      messagesMissingUser.push(message)
    }
  }
  return messagesMissingUser
}

export const filterMessages = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for messages with no chat in the chat array...')
  const messagesWithNoChat = await getMessagesWithNoChat(sourceDB)
  logger(`Found ${messagesWithNoChat.length} messages with no chat:`)
  logger(messagesWithNoChat)
  logger('Checking for deleted messages...')
  const deletedMessages = await getDeletedEntities<OldMessage>(
    sourceDB,
    'messages'
  )
  logger(`Found ${deletedMessages.length} deleted messages in the database:`)
  logger(deletedMessages)
  logger('Checking for messages with no sender...')
  const messagesWithNoSender = await getMessagesWithNoUser(sourceDB, 'sender')
  logger(`Found ${messagesWithNoSender.length} messages with no sender:`)
  logger(messagesWithNoSender)

  const uniqueMessages = getUniqueEntities<OldMessage>([
    ...deletedMessages,
    ...messagesWithNoChat,
    ...messagesWithNoSender
  ])
  if (uniqueMessages.length > 0) {
    logger(`Deleting ${uniqueMessages.length} messages...`)
    for (const message of uniqueMessages) {
      await deleteEntity(
        sourceDB,
        'messages',
        'message',
        {
          _id: message._id
        },
        logger
      )
    }
  } else {
    logger('No messages to delete, skipping filtering ...')
  }
}
