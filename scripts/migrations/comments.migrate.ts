import { CreateCommentDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldComment } from 'scripts/interfaces-v1'

export const commentMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedComments: OldComment[] = []
  try {
    const sourceCommentModel = sourceDB?.collection('comments')
    const targetCommentModel = targetDB?.collection('comments')
    const targetUserModel = targetDB?.collection('users')
    const targetPostModel = targetDB?.collection('posts')
    const sourceComments = await sourceCommentModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    for (let index = 0; index < sourceComments.length; index++) {
      const comment = sourceComments[index]
      const commentWithType: OldComment = comment as unknown as OldComment
      const user = await targetUserModel?.findOne({ _id: commentWithType.user })
      const post = await targetPostModel?.findOne({ _id: commentWithType.post })
      if (!user) {
        logger(`User not found, skipping ${commentWithType._id}`)
        passedComments.push(commentWithType)
        continue
      }
      if (!post) {
        logger(`Post not found, skipping ${commentWithType._id}`)
        passedComments.push(commentWithType)
        continue
      }
      logger(`Migrating comment: ${commentWithType._id}`)
      const newComment: Omit<CreateCommentDto, 'user' | 'post'> & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
        user: Types.ObjectId
        post: Types.ObjectId
      } = {
        _id: new Types.ObjectId(commentWithType._id.toString()),
        description: commentWithType.description,
        user: new Types.ObjectId(user._id),
        post: new Types.ObjectId(post._id),
        deletedAt: commentWithType.deleted ? new Date() : null,
        createdAt: commentWithType.createdAt,
        updatedAt: commentWithType.updatedAt
      }

      logger(`Inserting comment: ${newComment._id}`)
      await targetCommentModel?.insertOne(newComment as unknown as any)
      logger(`Updating post: ${post._id} comments count`)
      await targetPostModel?.updateOne(
        {
          _id: new Types.ObjectId(post._id)
        },
        { $inc: { comments: 1 } }
      )
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
