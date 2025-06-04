import fs from 'fs/promises'
import path from 'path'
import moment from 'moment'
import mongoose from 'mongoose'
import {
  checkAllAmenitiesExistInDb,
  checkAllCategoriesExistInDb,
  filterBuyPropertyRequests,
  filterChats,
  filterComments,
  filterCreditRequests,
  filterFollows,
  filterInteractions,
  filterLikes,
  filterMessages,
  filterNews,
  filterOfficialBlogs,
  filterPosts,
  filterPostSaves,
  filterProperties,
  filterSellPropertyRequests,
  filterUsers
} from 'scripts/filters'

import { amenitiesMigrations } from './amenities.migrate'
import { categoryMigrations } from './categories.migrate'
import { chatsMigrations } from './chats.migrate'
import { commentMigrations } from './comments.migrate'
import { migrateCreditRequests } from './credits-requests.migrate'
import { followMigrations } from './follows.migrate'
import { interactionsMigrations } from './interactions.migrate'
import { leadsMigrations } from './leads.migrate'
import { likeMigrations } from './likes.migrate'
import { messagesMigrations } from './messages.migrate'
import { newsMigrations } from './news.migrate'
import { officialBlogsMigrations } from './official-blogs.migrate'
import { postSavesMigrations } from './post-saves.migrate'
import { postMigrations } from './posts.migrate'
import { propertyMigrations } from './properties.migrate'
import { requestBuyPropertyMigrations } from './request-buy-property.migrate'
import { sellPropertyRequestMigrations } from './sell-property-request.migrate'
import { usersMigrations } from './user.migrate'

const logs: any[] = []

const sourceURI =
  process.env.MONGO_DB_SRC ??
  'mongodb+srv://truedar-stg:8ifPHJOL0CxvjK3a@cluster0.7lcu80m.mongodb.net/TrueDar-test'
const targetURI =
  process.env.MONGO_DB_TGT ??
  'mongodb+srv://truedar-stg:8ifPHJOL0CxvjK3a@cluster0.7lcu80m.mongodb.net/TrueDar-v2-migration'

const sourceDBConnection = mongoose.createConnection(sourceURI)
const targetDBConnection = mongoose.createConnection(targetURI)

const writeToFile = async (data: any) => {
  // Write results to JSON file
  const resultsDir = path.join(__dirname, 'logs')
  await fs.mkdir(resultsDir, { recursive: true })
  const filePath = path.join(
    resultsDir,
    `${moment().format('ddd MMM DD YYYY')}-logs.json`
  )
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

const createLogger = (moduleName: string) => {
  return (message: any) => {
    if (typeof message === 'string') {
      logs.push(
        `[${moduleName}] [${moment().format('HH:mm:ss:SSS')}] ${message}`
      )
      console.log(
        `[${moduleName}] [${moment().format('HH:mm:ss:SSS')}] ${message}`
      )
    } else {
      logs.push(message)
      console.log(`[${moduleName}] [${moment().format('HH:mm:ss:SSS')}]:`)
      console.log(JSON.stringify(message, null, 2))
    }
  }
}

async function main() {
  const sourceDB = (await sourceDBConnection.asPromise()).db
  const targetDB = (await targetDBConnection.asPromise()).db
  if (!sourceDB || !targetDB) {
    throw new Error('Database connection is not available.')
  }
  const logger = createLogger('main')
  const usersLogger = createLogger('users')
  const postsLogger = createLogger('posts')
  const commentsLogger = createLogger('comments')
  const likesLogger = createLogger('likes')
  const followsLogger = createLogger('follows')
  const chatsLogger = createLogger('chats')
  const messagesLogger = createLogger('messages')
  const officialBlogsLogger = createLogger('official-blogs')
  const amenitiesLogger = createLogger('amenities')
  const categoriesLogger = createLogger('categories')
  const propertiesLogger = createLogger('properties')
  const sellPropertyRequestsLogger = createLogger('sell-property-requests')
  const buyPropertyRequestsLogger = createLogger('buy-property-requests')
  const postSavesLogger = createLogger('post-saves')
  const interactionsLogger = createLogger('interactions')
  const leadsLogger = createLogger('leads')
  const newsLogger = createLogger('news')
  const subscriptionsLogger = createLogger('subscriptions')
  const creditsRequestsLogger = createLogger('credits-requests')
  // logger('Starting checkers')
  // logger(
  //   '============================== starting amenities check  ==============================='
  // )
  // await checkAllAmenitiesExistInDb(sourceDB, amenitiesLogger)
  // logger(
  //   '============================== finished amenities check  ==============================='
  // )
  // logger(
  //   '============================== starting categories check  ==============================='
  // )
  // await checkAllCategoriesExistInDb(sourceDB, categoriesLogger)
  // logger(
  //   '============================== finished categories check  ==============================='
  // )
  // logger('Ending checkers')
  // logger('Starting migrations')
  // // Users Migrations
  // logger(
  //   '============================== starting User Filtration  ==============================='
  // )
  // await filterUsers(sourceDB, usersLogger)
  // logger(
  //   '============================== finished User Filtration  ==============================='
  // )

  // logger(
  //   '============================== starting User migrations ==============================='
  // )
  // await usersMigrations(sourceDB, targetDB, usersLogger)
  // logger(
  //   '============================== finished User migrations ==============================='
  // )
  // // Subscriptions Module
  // logger(
  //   '============================== starting Subscriptions Filtration ==============================='
  // )
  // await filterSubscriptions(sourceDB, subscriptionsLogger)
  // logger(
  //   '============================== finished Subscriptions Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Subscriptions migrations ==============================='
  // )
  // await subscriptionsMigrations(sourceDB, targetDB, subscriptionsLogger)
  // logger(
  //   '============================== finished Subscriptions migrations ==============================='
  // )
  // // Credit Requests Module
  // logger(
  //   '============================== starting Credit Requests Filtration ==============================='
  // )
  // await filterCreditRequests(sourceDB, creditsRequestsLogger)
  // logger(
  //   '============================== finished Credit Requests Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Credit Requests migrations ==============================='
  // )
  // await migrateCreditRequests(sourceDB, targetDB, creditsRequestsLogger)
  // logger(
  //   '============================== finished Credit Requests migrations ==============================='
  // )
  // // Community Module Migrations
  // logger(
  //   '============================== starting Posts Filtration ==============================='
  // )
  // await filterPosts(sourceDB, postsLogger)
  // logger(
  //   '============================== finished Posts Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Posts migrations ==============================='
  // )
  // await postMigrations(sourceDB, targetDB, postsLogger)
  // logger(
  //   '============================== finished Posts migrations ==============================='
  // )

  // logger(
  //   '============================== starting Comments Filtration ==============================='
  // )
  // await filterComments(sourceDB, commentsLogger)
  // logger(
  //   '============================== finished Comments Filtration ==============================='
  // )

  // logger(
  //   '============================== starting Comments migrations =============================='
  // )
  // await commentMigrations(sourceDB, targetDB, commentsLogger)
  // logger(
  //   '============================== finished Comments migrations =============================='
  // )
  // logger(
  //   '============================== starting Likes Filtration ==============================='
  // )
  // await filterLikes(sourceDB, likesLogger)
  // logger(
  //   '============================== finished Likes Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Likes migrations =============================='
  // )
  // await likeMigrations(sourceDB, targetDB, likesLogger)
  // logger(
  //   '============================== finished Likes migrations =============================='
  // )
  // // Post Saves Module
  // logger(
  //   '============================== starting Post Saves Filtration =============================='
  // )
  // await filterPostSaves(sourceDB, postSavesLogger)
  // logger(
  //   '============================== finished Post Saves Filtration =============================='
  // )
  // logger(
  //   '============================== starting Post Saves migrations =============================='
  // )
  // await postSavesMigrations(sourceDB, targetDB, postSavesLogger)
  // logger(
  //   '============================== finished Post Saves migrations =============================='
  // )
  // logger(
  //   '============================== starting Request Buy Property Filtration =============================='
  // )
  // logger(
  //   '============================== starting Follows Filtration ==============================='
  // )
  // await filterFollows(sourceDB, followsLogger)
  // logger(
  //   '============================== finished Follows Filtration ==============================='
  // )
  // logger(
  //   '============================== starting follows migrations =============================='
  // )
  // await followMigrations(sourceDB, targetDB, followsLogger)
  // logger(
  //   '============================== finished follows migrations =============================='
  // )
  // // Messages Module
  // logger(
  //   '============================== starting Chats Filtration ==============================='
  // )
  // await filterChats(sourceDB, chatsLogger)
  // logger(
  //   '============================== finished Chats Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Chats migrations =============================='
  // )
  // await chatsMigrations(sourceDB, targetDB, chatsLogger)
  // logger(
  //   '============================== finished Chats migrations =============================='
  // )
  // logger(
  //   '============================== starting Messages Filtration ==============================='
  // )
  // await filterMessages(sourceDB, messagesLogger)
  // logger(
  //   '============================== finished Messages Filtration ==============================='
  // )
  // logger(
  //   '============================== starting Messages migrations =============================='
  // )
  // await messagesMigrations(sourceDB, targetDB, messagesLogger)
  // logger(
  //   '============================== finished Messages migrations =============================='
  // )
  // // Official Blogs Module
  // logger(
  //   '============================== starting Official Blogs Filtration =============================='
  // )
  // await filterOfficialBlogs(sourceDB, officialBlogsLogger)
  // logger(
  //   '============================== finished Official Blogs Filtration =============================='
  // )
  // logger(
  //   '============================== starting Official Blogs migrations =============================='
  // )
  // await officialBlogsMigrations(sourceDB, targetDB, officialBlogsLogger)
  // logger(
  //   '============================== finished Official Blogs migrations =============================='
  // )
  // // Amenities Module
  // logger(
  //   '============================== starting Amenities migrations =============================='
  // )
  // await amenitiesMigrations(sourceDB, targetDB, amenitiesLogger)
  // logger(
  //   '============================== finished Amenities migrations =============================='
  // )
  // // Categories Module
  // logger(
  //   '============================== starting Categories migrations =============================='
  // )
  // await categoryMigrations(sourceDB, targetDB, categoriesLogger)
  // logger(
  //   '============================== finished Categories migrations =============================='
  // )
  // // Properties Module
  // logger(
  //   '============================== starting Properties Filtration =============================='
  // )
  // await filterProperties(sourceDB, targetDB, propertiesLogger)
  // logger(
  //   '============================== finished Properties Filtration =============================='
  // )
  // logger(
  //   '============================== starting Properties migrations =============================='
  // )
  // await propertyMigrations(sourceDB, targetDB, propertiesLogger)
  // logger(
  //   '============================== finished Properties migrations =============================='
  // )
  // // Sell Property Requests Module
  // logger(
  //   '============================== starting Sell Property Requests Filtration =============================='
  // )
  // await filterSellPropertyRequests(sourceDB, sellPropertyRequestsLogger)
  // logger(
  //   '============================== finished Sell Property Requests Filtration =============================='
  // )
  // logger(
  //   '============================== starting Sell Property Requests migrations =============================='
  // )
  // await sellPropertyRequestMigrations(
  //   sourceDB,
  //   targetDB,
  //   sellPropertyRequestsLogger
  // )
  // logger(
  //   '============================== finished Sell Property Requests migrations =============================='
  // )
  // // Buy Property Requests Module

  // await filterBuyPropertyRequests(sourceDB, targetDB, buyPropertyRequestsLogger)
  // logger(
  //   '============================== finished Request Buy Property Filtration =============================='
  // )
  // logger(
  //   '============================== starting Request Buy Property migrations =============================='
  // )
  // await requestBuyPropertyMigrations(
  //   sourceDB,
  //   targetDB,
  //   buyPropertyRequestsLogger
  // )
  // logger(
  //   '============================== finished Request Buy Property migrations =============================='
  // )
  // //  Interactions Module
  // logger(
  //   '============================== starting interactions Filtration =============================='
  // )
  // await filterInteractions(sourceDB, interactionsLogger)
  // logger(
  //   '============================== finished interactions Filtration =============================='
  // )
  // logger(
  //   '============================== starting interactions migrations =============================='
  // )
  // await interactionsMigrations(sourceDB, targetDB, interactionsLogger)
  // logger(
  //   '============================== finished interactions migrations =============================='
  // )
  // logger(
  //   '============================== starting leads migrations =============================='
  // )
  // await leadsMigrations(targetDB, leadsLogger)
  // logger(
  //   '============================== finished leads migrations =============================='
  // )
  // // News Module
  // logger(
  //   '============================== starting News Filtration =============================='
  // )
  // await filterNews(sourceDB, newsLogger)
  // logger(
  //   '============================== finished News Filtration =============================='
  // )
  // logger(
  //   '============================== starting News migrations =============================='
  // )
  // await newsMigrations(sourceDB, targetDB, newsLogger)
  // logger(
  //   '============================== finished News migrations =============================='
  // )
  logger('finished migrations')
  await writeToFile(logs)
  await sourceDBConnection.close()
  await targetDBConnection.close()
  return
}

main()
