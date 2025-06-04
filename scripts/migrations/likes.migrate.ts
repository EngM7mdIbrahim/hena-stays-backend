import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldLikes } from 'scripts/interfaces-v1'

export const likeMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedLikes: OldLikes[] = []
  let insertedLikes: number = 0
  try {
    const sourceLikeModel = sourceDB?.collection('likes')
    const targetLikeModel = targetDB?.collection('likes')
    const targetCommentModel = targetDB?.collection('comments')
    const targetPostModel = targetDB?.collection('posts')
    const targetUserModel = targetDB?.collection('users')

    const sourceLikes = await sourceLikeModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    for (let index = 0; index < sourceLikes.length; index++) {
      const like = sourceLikes[index]
      const likeWithType: OldLikes = like as unknown as OldLikes

      // Check if user exists
      const user = await targetUserModel?.findOne({ _id: likeWithType.user })
      if (!user) {
        logger(`Skipping like ${likeWithType._id} - User not found`)
        passedLikes.push(likeWithType)
        continue
      }

      let post = null
      let comment = null

      // Check post and comment references
      if (likeWithType.post && likeWithType.comment) {
        logger(
          `Skipping like ${likeWithType._id} - Cannot have both post and comment`
        )
        passedLikes.push(likeWithType)
        continue
      }

      if (likeWithType.post) {
        post = await targetPostModel?.findOne({ _id: likeWithType.post })
        if (!post) {
          logger(
            `Skipping like ${likeWithType._id} - Referenced post not found`
          )
          passedLikes.push(likeWithType)
          continue
        }
      }

      if (likeWithType.comment) {
        comment = await targetCommentModel?.findOne({
          _id: likeWithType.comment
        })
        if (!comment) {
          logger(
            `Skipping like ${likeWithType._id} - Referenced comment not found`
          )
          passedLikes.push(likeWithType)
          continue
        }
      }

      if (!post && !comment) {
        logger(
          `Skipping like ${likeWithType._id} - Neither post nor comment found`
        )
        passedLikes.push(likeWithType)
        continue
      }

      const newLike = {
        _id: new Types.ObjectId(likeWithType._id.toString()),
        user: new Types.ObjectId(user._id),
        post: post ? new Types.ObjectId(post._id) : null,
        comment: comment ? new Types.ObjectId(comment._id) : null,
        createdAt: likeWithType.createdAt,
        updatedAt: likeWithType.updatedAt,
        deletedAt: likeWithType.deleted ? new Date() : null
      }
      logger(`Inserting like: ${likeWithType._id}`)
      await targetLikeModel?.insertOne(newLike)
      insertedLikes++
      if (post) {
        logger(`Updating post: ${post._id} likes count`)
        await targetPostModel?.updateOne(
          { _id: post._id },
          { $inc: { likes: 1 } }
        )
      }
      if (comment) {
        logger(`Updating comment: ${comment._id} likes count`)
        await targetCommentModel?.updateOne(
          { _id: comment._id },
          { $inc: { likes: 1 } }
        )
      }
    }

    logger('Like migration completed')
    logger(`There are ${insertedLikes} likes inserted`)
    if (passedLikes.length > 0) {
      logger(`There are ${passedLikes.length} likes passed`)
      logger(passedLikes)
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
