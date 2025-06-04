import type { CreatePostDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldPost } from 'scripts/interfaces-v1'

import { getLocationIfNotExists } from './commonMappers/location.default'

let insertedPosts: number = 0
export const postMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedPosts: OldPost[] = []
  const targetUserModel = targetDB?.collection('users')
  const targetPostModel = targetDB?.collection('posts')
  const sourcePostModel = sourceDB?.collection('posts')
  const sourcePosts =
    (await sourcePostModel?.find().sort({ createdAt: 1 }).toArray()) ?? []

  for (let index = 0; index < sourcePosts.length; index++) {
    const post = sourcePosts[index]
    const postWithType: OldPost = post as unknown as OldPost
    const user = await targetUserModel?.findOne({ _id: postWithType.user })
    if (!user) {
      logger(
        `User not found for post: ${postWithType._id} in the targetDB, skipping...`
      )
      passedPosts.push(postWithType)
      continue
    }
    const newPost: Omit<CreatePostDto, 'user'> & {
      _id: Types.ObjectId
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
      user: Types.ObjectId
    } = {
      _id: new Types.ObjectId(postWithType._id.toString()),
      description: postWithType.description,
      location: getLocationIfNotExists(postWithType.location),
      media: postWithType.media,
      user: user._id,
      deletedAt: postWithType.deleted ? new Date() : null,
      createdAt: postWithType.createdAt,
      updatedAt: postWithType.updatedAt
    }
    logger(`Inserting post: ${newPost._id}`)
    await targetPostModel?.insertOne(newPost as unknown as any)
    insertedPosts++
  }
  logger(`There are ${insertedPosts} posts inserted`)
  logger(`There are ${passedPosts.length} posts passed`)
  logger(passedPosts)
}
