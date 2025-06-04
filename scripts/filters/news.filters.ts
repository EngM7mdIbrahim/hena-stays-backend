import { Db } from 'mongodb'
import { OldLikes } from 'scripts/interfaces-v1/likes.interface-v1'
import { OldNews } from 'scripts/interfaces-v1/news.interface-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

export const getNewsOlderThanTwoMonths = async (sourceDB: Db) => {
  const news = ((await sourceDB
    .collection('news')
    .find({
      createdAt: { $lt: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000) }
    })
    .toArray()) ?? []) as OldNews[]
  return news
}

export const filterNews = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for deleted news...')
  const deletedNews = await getDeletedEntities<OldNews>(sourceDB, 'news')
  logger(`Found ${deletedNews.length} deleted news in the database:`)
  logger(deletedNews.map((news) => news._id))
  logger('Checking for news older than two months...')
  const newsOlderThanTwoMonths = await getNewsOlderThanTwoMonths(sourceDB)
  logger(
    `Found ${newsOlderThanTwoMonths.length} news older than two months in the database:`
  )
  logger(newsOlderThanTwoMonths.map((news) => news._id))
  const uniqueNews = getUniqueEntities<OldNews>([
    ...deletedNews,
    ...newsOlderThanTwoMonths
  ])
  if (uniqueNews.length > 0) {
    logger(`Deleting ${uniqueNews.length} news...`)
    for (const news of uniqueNews) {
      await deleteEntity(sourceDB, 'news', 'news', { _id: news._id }, logger)
    }
  } else {
    logger('No news to delete, skipping filtering...')
  }
}
