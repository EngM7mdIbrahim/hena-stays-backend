import type { CreateNewsDto, CreatePostDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldNews, OldPost } from 'scripts/interfaces-v1'

let insertedNews: number = 0
export const newsMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedNews: OldNews[] = []
  const targetNewsModel = targetDB?.collection('news')
  const sourceNewsModel = sourceDB?.collection('news')
  const sourceNews =
    (await sourceNewsModel?.find().sort({ createdAt: 1 }).toArray()) ?? []

  for (let index = 0; index < sourceNews.length; index++) {
    const news = sourceNews[index]
    const newsWithType: OldNews = news as unknown as OldNews
    if (!newsWithType.image) {
      passedNews.push(newsWithType)
      logger(`Skipping news: ${newsWithType._id} - no image found, skipping...`)
      continue
    }
    const newNews: Omit<CreateNewsDto, '_id'> & {
      _id: Types.ObjectId
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    } = {
      _id: new Types.ObjectId(newsWithType._id.toString()),
      title: newsWithType.title,
      subtitle: newsWithType.subTitle,
      image: newsWithType.image,
      reference: newsWithType.reference,
      author: newsWithType.author,
      content: newsWithType.content,
      deletedAt: newsWithType.deleted ? new Date() : null,
      createdAt: newsWithType.createdAt,
      updatedAt: newsWithType.updatedAt
    }
    logger(`Inserting news: ${newNews._id}`)
    await targetNewsModel?.insertOne(newNews as unknown as any)
    insertedNews++
  }
  logger(`There are ${insertedNews} news inserted`)
}
