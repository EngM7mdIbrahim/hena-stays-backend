import { GENERAL_ENDPOINTS } from '@commonTypes'
import { Router } from 'express'

import amenityRoutes from './amenity.routes'
import analyticsRoutes from './analytics.routes'
import authRoutes from './auth.routes'
import blogsRoutes from './blogs.routes'
import callRequestRoutes from './call-request.routes'
import categoryRoutes from './category.routes'
import chatsRoutes from './chats.routes'
import commentsRoutes from './comments.routes'
import configRoutes from './config.routes'
import contactUsRoutes from './contact-us.routes'
import creditsRequestsRoutes from './credits-requests.routes'
import followsRoutes from './follows.routes'
import googleRouter from './google.routes'
import imagesRoutes from './images.routes'
import interactionsRoutes from './interactions.routes'
import leadsRoutes from './leads.routes'
import likesRoutes from './likes.routes'
import newsRoutes from './news.routes'
import notificationRoutes from './notification.routes'
import officialBlogsRoutes from './official-blog.routes'
import paymentRoutes from './payment.routes'
import savesRoutes from './posts-saves.routes'
import postsRoutes from './posts.routes'
import projectsRoutes from './project.routes'
import propertySavesRoutes from './properties-saves.routes'
import propertiesXMLRoutes from './properties-xml.routes'
import propertyRoutes from './property.routes'
import requestBuyPropertyRoutes from './request-buy-property.routes'
import requestSellPropertyRoutes from './request-sell-property.routes'
import schedulerRoutes from './schedulers.routes'
import subCategoryRoutes from './subCategory.routes'
import subscriptionRoutes from './subscriptions.routes'
import userRoutes from './user.routes'

const appRouter = Router()

appRouter.use(GENERAL_ENDPOINTS.AUTH, authRoutes)
appRouter.use(GENERAL_ENDPOINTS.IMAGES, imagesRoutes)
appRouter.use(GENERAL_ENDPOINTS.USERS, userRoutes)
appRouter.use(GENERAL_ENDPOINTS.POSTS, postsRoutes)
appRouter.use(GENERAL_ENDPOINTS.COMMENTS, commentsRoutes)
appRouter.use(GENERAL_ENDPOINTS.POSTS_SAVES, savesRoutes)
appRouter.use(GENERAL_ENDPOINTS.FOLLOWS, followsRoutes)
appRouter.use(GENERAL_ENDPOINTS.LIKES, likesRoutes)
appRouter.use(GENERAL_ENDPOINTS.GOOGLE, googleRouter)
appRouter.use(GENERAL_ENDPOINTS.BLOGS, blogsRoutes)
appRouter.use(GENERAL_ENDPOINTS.OFFICIAL_BLOGS, officialBlogsRoutes)
appRouter.use(GENERAL_ENDPOINTS.CATEGORIES, categoryRoutes)
appRouter.use(GENERAL_ENDPOINTS.SUBCATEGORIES, subCategoryRoutes)
appRouter.use(GENERAL_ENDPOINTS.PROPERTY, propertyRoutes)
appRouter.use(GENERAL_ENDPOINTS.PROJECTS, projectsRoutes)
appRouter.use(
  GENERAL_ENDPOINTS.REQUEST_SELL_PROPERTY,
  requestSellPropertyRoutes
)
appRouter.use(GENERAL_ENDPOINTS.REQUEST_BUY_PROPERTY, requestBuyPropertyRoutes)
appRouter.use(GENERAL_ENDPOINTS.PROPERTY_SAVES, propertySavesRoutes)
appRouter.use(GENERAL_ENDPOINTS.AMENITIES, amenityRoutes)
appRouter.use(GENERAL_ENDPOINTS.CALL_REQUESTS, callRequestRoutes)
appRouter.use(GENERAL_ENDPOINTS.CHATS, chatsRoutes)
appRouter.use(GENERAL_ENDPOINTS.LEADS, leadsRoutes)
appRouter.use(GENERAL_ENDPOINTS.INTERACTIONS, interactionsRoutes)
appRouter.use(GENERAL_ENDPOINTS.ANALYTICS, analyticsRoutes)
appRouter.use(GENERAL_ENDPOINTS.NEWS, newsRoutes)
appRouter.use(GENERAL_ENDPOINTS.SCHEDULER, schedulerRoutes)
appRouter.use(GENERAL_ENDPOINTS.NOTIFICATIONS, notificationRoutes)
appRouter.use(GENERAL_ENDPOINTS.PROPERTIES_XML, propertiesXMLRoutes)
appRouter.use(GENERAL_ENDPOINTS.CONTACT_US, contactUsRoutes)
appRouter.use(GENERAL_ENDPOINTS.CONFIG, configRoutes)
appRouter.use(GENERAL_ENDPOINTS.SUBSCRIPTIONS, subscriptionRoutes)
appRouter.use(GENERAL_ENDPOINTS.PAYMENT, paymentRoutes)
appRouter.use(GENERAL_ENDPOINTS.CREDITS_REQUESTS, creditsRequestsRoutes)
export default appRouter
