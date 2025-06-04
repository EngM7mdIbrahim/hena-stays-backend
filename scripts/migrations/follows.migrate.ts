import type { CreateFollowDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldFollow } from 'scripts/interfaces-v1'

export const followMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  let insertedFollows: number = 0
  const passedFollows: OldFollow[] = []
  try {
    const targetFollowModel = targetDB?.collection('follows')
    const sourceFollowModel = sourceDB?.collection('follows')
    const targetUserModel = targetDB?.collection('users')
    const follows = await sourceFollowModel.find().toArray()
    // now we loop through the follows and add them to the db
    for (const follow of follows) {
      const followWithType: OldFollow = follow as unknown as OldFollow
      const follower = await targetUserModel.findOne({
        _id: follow.follower
      })
      const following = await targetUserModel.findOne({
        _id: follow.following
      })
      if (!follower) {
        logger(`Follower not found, skipping ${follow._id}`)
        passedFollows.push(followWithType)
        continue
      }
      if (!following) {
        logger(`Following not found, skipping ${follow._id}`)
        passedFollows.push(followWithType)
        continue
      }
      const followCreate: Omit<CreateFollowDto, 'follower' | 'following'> & {
        _id: Types.ObjectId
        createdAt: Date
        updatedAt: Date
        deletedAt: Date | null
        follower: Types.ObjectId
        following: Types.ObjectId
      } = {
        _id: new Types.ObjectId(followWithType._id),
        follower: new Types.ObjectId(followWithType.follower),
        following: new Types.ObjectId(followWithType.following),
        createdAt: followWithType.createdAt,
        updatedAt: followWithType.updatedAt,
        deletedAt: followWithType.deleted ? followWithType.updatedAt : null
      }
      logger(`Inserting follow: ${followCreate._id}`)
      await targetFollowModel.insertOne(followCreate)
    }
    logger(`Inserted ${insertedFollows} follows`)
    if (passedFollows.length > 0) {
      logger(`Passed follows: ${passedFollows.length}`)
      for (const follow of passedFollows) {
        logger(`Follow: ${follow._id}`)
      }
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
