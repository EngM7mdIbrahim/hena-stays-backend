import { Db } from 'mongodb'
import { OldComment } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getCommentsWithNoUser = async (sourceDB: Db) => {
  const commentsWithNoUser: OldComment[] = []
  const comments = ((await sourceDB
    .collection('comments')
    .find({})
    .toArray()) ?? []) as OldComment[]
  for (const comment of comments) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: comment.user })
    if (!user) {
      commentsWithNoUser.push(comment)
    }
  }
  return commentsWithNoUser
}

const getCommentsWithNoPost = async (sourceDB: Db) => {
  const commentsWithNoPost: OldComment[] = []
  const comments = ((await sourceDB
    .collection('comments')
    .find({})
    .toArray()) ?? []) as OldComment[]
  for (const comment of comments) {
    const post = await sourceDB
      .collection('posts')
      .findOne({ _id: comment.post })
    if (!post) {
      commentsWithNoPost.push(comment)
    }
  }
  return commentsWithNoPost
}

export async function filterComments(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted comments...')
  const deletedComments = await getDeletedEntities<OldComment>(
    sourceDB,
    'comments'
  )
  logger(`Found ${deletedComments.length} deleted comments:`)
  logger(deletedComments)
  logger('Checking for comments with no user...')
  const commentsWithNoUser = await getCommentsWithNoUser(sourceDB)
  logger(`Found ${commentsWithNoUser.length} comments with no user:`)
  logger(commentsWithNoUser)
  logger('Checking for comments with no post...')
  const commentsWithNoPost = await getCommentsWithNoPost(sourceDB)
  logger(`Found ${commentsWithNoPost.length} comments with no post:`)
  logger(commentsWithNoPost)
  const uniqueComments = getUniqueEntities<OldComment>([
    ...deletedComments,
    ...commentsWithNoUser,
    ...commentsWithNoPost
  ])
  if (uniqueComments.length > 0) {
    logger('Deleting comments with no user...')
    for (const comment of uniqueComments) {
      await deleteEntity(
        sourceDB,
        'comments',
        'comment',
        { _id: comment._id },
        logger
      )
    }
  } else {
    logger('No comments with no user found, skipping filtering ...')
  }
}
