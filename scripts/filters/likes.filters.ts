import { Db } from 'mongodb'
import { OldLikes } from 'scripts/interfaces-v1/likes.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getLikesWithNoUser = async (sourceDB: Db) => {
  const likesWithNoUser: OldLikes[] = []
  const likes = ((await sourceDB.collection('likes').find({}).toArray()) ??
    []) as OldLikes[]
  for (const like of likes) {
    const user = await sourceDB.collection('users').findOne({ _id: like.user })
    if (!user) {
      likesWithNoUser.push(like)
    }
  }
  return likesWithNoUser
}

const getLikesWithNoPostOrComment = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for likes with no post ids and comment ids...')
  const likesMissingPostAndComment = ((await sourceDB
    .collection('likes')
    .find({
      $and: [{ post: { $exists: false } }, { comment: { $exists: false } }]
    })
    .toArray()) ?? []) as OldLikes[]
  logger(
    `Found ${likesMissingPostAndComment.length} likes with no post ids and comment ids:`
  )
  logger(likesMissingPostAndComment)
  const otherLikes = ((await sourceDB
    .collection('likes')
    .find({ _id: { $nin: likesMissingPostAndComment.map((like) => like._id) } })
    .toArray()) ?? []) as OldLikes[]

  const likesMissingPost: OldLikes[] = []
  const likesMissingComment: OldLikes[] = []
  for (const like of otherLikes) {
    if (like.post) {
      const existingPost = await sourceDB
        .collection('posts')
        .findOne({ _id: like.post })
      if (!existingPost) {
        likesMissingPost.push(like)
      }
    }
    if (like.comment) {
      const existingComment = await sourceDB
        .collection('comments')
        .findOne({ _id: like.comment })
      if (!existingComment) {
        likesMissingComment.push(like)
      }
    }
  }
  logger(
    `Found ${likesMissingPost.length} likes with no posts in the database:`
  )
  logger(likesMissingPost)
  logger(
    `Found ${likesMissingComment.length} likes with no comments in the database:`
  )
  logger(likesMissingComment)
  return [
    ...likesMissingPostAndComment,
    ...likesMissingPost,
    ...likesMissingComment
  ]
}

const getLikesWithBothPostAndComment = async (sourceDB: Db) => {
  return ((await sourceDB
    .collection('likes')
    .find({
      $and: [{ post: { $exists: true } }, { comment: { $exists: true } }]
    })
    .toArray()) ?? []) as OldLikes[]
}

export const filterLikes = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for deleted likes...')
  const likesWithNoUser = await getLikesWithNoUser(sourceDB)
  logger(`Found ${likesWithNoUser.length} likes with no user:`)
  logger(likesWithNoUser)
  logger('Checking for likes with no post or comment...')
  const likesWithNoPostOrComment = await getLikesWithNoPostOrComment(
    sourceDB,
    logger
  )
  logger(
    `Found in total ${likesWithNoPostOrComment.length} likes with no post or comment:`
  )
  logger(likesWithNoPostOrComment)
  logger('Checking for likes with both post and comment...')
  const likesWithBothPostAndComment =
    await getLikesWithBothPostAndComment(sourceDB)
  logger(
    `Found ${likesWithBothPostAndComment.length} likes with both post and comment:`
  )
  logger(likesWithBothPostAndComment)
  logger('Checking for deleted likes...')
  const deletedLikes = await getDeletedEntities<OldLikes>(sourceDB, 'likes')
  logger(`Found ${deletedLikes.length} deleted likes in the database:`)
  logger(deletedLikes)
  const uniqueLikes = getUniqueEntities<OldLikes>([
    ...deletedLikes,
    ...likesWithNoUser,
    ...likesWithNoPostOrComment,
    ...likesWithBothPostAndComment
  ])
  if (uniqueLikes.length > 0) {
    logger(`Deleting ${uniqueLikes.length} likes...`)
    for (const like of uniqueLikes) {
      await deleteEntity(sourceDB, 'likes', 'like', { _id: like._id }, logger)
    }
  } else {
    logger('No likes to delete, skipping filtering ...')
  }
}
