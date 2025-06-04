import { Db } from 'mongodb'
import { OldFollow } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getFollowsForTheSameUser = async (sourceDB: Db) => {
  const followsForTheSameUser: OldFollow[] = []
  const follows = ((await sourceDB.collection('follows').find({}).toArray()) ??
    []) as OldFollow[]
  for (const follow of follows) {
    const follower = await sourceDB
      .collection('users')
      .findOne({ _id: follow.follower })
    const following = await sourceDB
      .collection('users')
      .findOne({ _id: follow.following })
    if (follower && following && follower._id === following._id) {
      followsForTheSameUser.push(follow)
    }
  }
  return followsForTheSameUser
}

const getFollowsWithNoUser = async (sourceDB: Db) => {
  const followsWithNoUser: OldFollow[] = []
  const follows = ((await sourceDB.collection('follows').find({}).toArray()) ??
    []) as OldFollow[]
  for (const follow of follows) {
    const follower = await sourceDB
      .collection('users')
      .findOne({ _id: follow.follower })
    const following = await sourceDB
      .collection('users')
      .findOne({ _id: follow.following })
    if (!follower || !following) {
      followsWithNoUser.push(follow)
    }
  }
  return followsWithNoUser
}
export async function filterFollows(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted follows...')
  const deletedFollows = await getDeletedEntities<OldFollow>(
    sourceDB,
    'follows'
  )
  logger(`Found ${deletedFollows.length} deleted follows:`)
  logger(deletedFollows)
  logger('Checking for follows with no user...')
  const followsWithNoUser = await getFollowsWithNoUser(sourceDB)
  logger(`Found ${followsWithNoUser.length} follows with no user:`)
  logger(followsWithNoUser)
  logger('Checking for follows for the same user...')
  const followsForTheSameUser = await getFollowsForTheSameUser(sourceDB)
  logger(`Found ${followsForTheSameUser.length} follows for the same user:`)
  logger(followsForTheSameUser)
  const uniqueFollows = getUniqueEntities<OldFollow>([
    ...deletedFollows,
    ...followsWithNoUser,
    ...followsForTheSameUser
  ])
  if (uniqueFollows.length > 0) {
    logger('Deleting follows with no user...')
    for (const follow of uniqueFollows) {
      await deleteEntity(
        sourceDB,
        'follows',
        'follow',
        { _id: follow._id },
        logger
      )
    }
  } else {
    logger('No follows with no user found, skipping filtering ...')
  }
}
