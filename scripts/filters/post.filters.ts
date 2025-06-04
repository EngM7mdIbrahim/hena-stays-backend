import { ObjectId } from 'bson'
import { Db, Document, Filter, WithId } from 'mongodb'
import { OldPost } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getPostsWithNoUser = async (sourceDB: Db) => {
  const postsWithNoUser: OldPost[] = []
  const posts = ((await sourceDB.collection('posts').find({}).toArray()) ??
    []) as OldPost[]
  for (const post of posts) {
    const user = await sourceDB.collection('users').findOne({ _id: post.user })
    if (!user) {
      postsWithNoUser.push(post)
    }
  }
  return postsWithNoUser
}

export async function filterPosts(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted posts...')
  const deletedPosts = await getDeletedEntities<OldPost>(sourceDB, 'posts')
  logger(`Found ${deletedPosts.length} deleted posts:`)
  logger(deletedPosts)
  logger('Checking for posts with no user...')
  const postsWithNoUser = await getPostsWithNoUser(sourceDB)
  logger(`Found ${postsWithNoUser.length} posts with no user:`)
  logger(postsWithNoUser)
  const uniquePosts = getUniqueEntities<OldPost>([
    ...deletedPosts,
    ...postsWithNoUser
  ])
  if (uniquePosts.length > 0) {
    logger('Deleting posts with no user...')
    for (const post of uniquePosts) {
      await deleteEntity(sourceDB, 'posts', 'post', { _id: post._id }, logger)
    }
  } else {
    logger('No posts with no user found, skipping filtering ...')
  }
}
