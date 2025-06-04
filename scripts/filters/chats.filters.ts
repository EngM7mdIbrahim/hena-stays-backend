import { Db } from 'mongodb'
import { OldChat } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getChatsWithNoUser = async (sourceDB: Db) => {
  const chatsMissingUsers: OldChat[] = []
  const chats = ((await sourceDB.collection('chats').find({}).toArray()) ??
    []) as OldChat[]
  for (const chat of chats) {
    for (const userId of chat.users) {
      const user = await sourceDB.collection('users').findOne({ _id: userId })
      if (!user) {
        chatsMissingUsers.push(chat)
      }
    }
  }
  return chatsMissingUsers
}

export const filterChats = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for chats with no user in the users array...')
  const chatsWithNoUser = await getChatsWithNoUser(sourceDB)
  logger(`Found ${chatsWithNoUser.length} chats with no user:`)
  logger(chatsWithNoUser)
  logger('Checking for deleted chats...')
  const deletedChats = await getDeletedEntities<OldChat>(sourceDB, 'chats')
  logger(`Found ${deletedChats.length} deleted chats in the database:`)
  logger(deletedChats)
  const uniqueChats = getUniqueEntities<OldChat>([
    ...deletedChats,
    ...chatsWithNoUser
  ])
  if (uniqueChats.length > 0) {
    logger(`Deleting ${uniqueChats.length} chats...`)
    for (const chat of uniqueChats) {
      await deleteEntity(sourceDB, 'chats', 'chat', { _id: chat._id }, logger)
    }
  } else {
    logger('No chats to delete, skipping filtering ...')
  }
}
