import { Db } from 'mongodb'
import { OldPostSave } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getPostSavesWithNoUser = async (sourceDB: Db) => {
  const postSavesWithNoUser: OldPostSave[] = []
  const postSaves = ((await sourceDB.collection('saves').find({}).toArray()) ??
    []) as OldPostSave[]
  for (const postSave of postSaves) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: postSave.user })
    if (!user) {
      postSavesWithNoUser.push(postSave)
    }
  }
  return postSavesWithNoUser
}

const getPostSavesWithNoPost = async (sourceDB: Db) => {
  const postSavesWithNoPost: OldPostSave[] = []
  const postSaves = ((await sourceDB.collection('saves').find({}).toArray()) ??
    []) as OldPostSave[]
  for (const postSave of postSaves) {
    const post = await sourceDB
      .collection('posts')
      .findOne({ _id: postSave.post })
    if (!post) {
      postSavesWithNoPost.push(postSave)
    }
  }
  return postSavesWithNoPost
}

export async function filterPostSaves(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted post saves...')
  const deletedPostSaves = await getDeletedEntities<OldPostSave>(
    sourceDB,
    'saves'
  )
  logger(`Found ${deletedPostSaves.length} deleted post saves:`)
  logger(deletedPostSaves)
  logger('Checking for post saves with no user...')
  const postSavesWithNoUser = await getPostSavesWithNoUser(sourceDB)
  logger(`Found ${postSavesWithNoUser.length} post saves with no user:`)
  logger(postSavesWithNoUser)
  logger('Checking for post saves with no post...')
  const postSavesWithNoPost = await getPostSavesWithNoPost(sourceDB)
  logger(`Found ${postSavesWithNoPost.length} post saves with no post:`)
  logger(postSavesWithNoPost)
  const uniquePostSaves = getUniqueEntities<OldPostSave>([
    ...deletedPostSaves,
    ...postSavesWithNoUser,
    ...postSavesWithNoPost
  ])
  if (uniquePostSaves.length > 0) {
    logger('Deleting post saves with no user...')
    for (const postSave of uniquePostSaves) {
      await deleteEntity(
        sourceDB,
        'saves',
        'postSave',
        { _id: postSave._id },
        logger
      )
    }
  } else {
    logger('No post saves with no user or post found, skipping filtering...')
  }
}
