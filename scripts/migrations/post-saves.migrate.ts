import { MediaTypes } from '@commonTypes'
import { CreatePostSaveDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldPostSave } from 'scripts/interfaces-v1'

export const postSavesMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedPostSaves: OldPostSave[] = []
  let insertedPostSaves: number = 0
  try {
    const sourcePostSaveModel = sourceDB?.collection('saves')
    const targetPostSaveModel = targetDB?.collection('postsaves')
    const targetPostModel = targetDB?.collection('posts')
    const targetUserModel = targetDB?.collection('users')

    const sourcePostSaves = (await sourcePostSaveModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()) as OldPostSave[]

    for (let index = 0; index < sourcePostSaves.length; index++) {
      const postSave = sourcePostSaves[index] as OldPostSave

      // Check if sender exists
      const user = await targetUserModel?.findOne({
        _id: postSave.user
      })
      if (!user) {
        logger(
          `Skipping post save ${postSave._id} - sender not found with id: ${postSave.user}`
        )
        passedPostSaves.push(postSave)
        continue
      }
      // Check if post exists
      const post = await targetPostModel?.findOne({ _id: postSave.post })
      if (!post) {
        logger(
          `Skipping post save ${postSave._id} - post not found with id: ${postSave.post}`
        )
        passedPostSaves.push(postSave)
        continue
      }
      logger(`Inserting post save: ${postSave._id}`)
      const newPostSave: Omit<CreatePostSaveDto, 'user' | 'post'> & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
        user: Types.ObjectId
        post: Types.ObjectId
      } = {
        _id: new Types.ObjectId(postSave._id.toString()),
        createdAt: postSave.createdAt,
        updatedAt: postSave.updatedAt,
        user: postSave.user,
        post: postSave.post,
        deletedAt: postSave.deleted ? new Date() : null
      }
      await targetPostSaveModel?.insertOne(newPostSave)
      insertedPostSaves++
    }

    logger('Post save migration completed')
    logger(`There are ${insertedPostSaves} post saves inserted`)
    if (passedPostSaves.length > 0) {
      logger(`There are ${passedPostSaves.length} post saves passed`)
      logger(passedPostSaves)
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
