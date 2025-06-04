import { env } from '@config'
import { CreateNewsDto, INewsDocument } from '@contracts'
import { NewsModel } from '@models'
import axios from 'axios'
import { load } from 'cheerio'
import moment from 'moment'

import { getActorData } from '@utils'

import { BaseService } from './base.service'
import { loggerService } from './logger.service'

class NewsService extends BaseService<INewsDocument, CreateNewsDto> {
  constructor() {
    super(NewsModel)
    this.newsScheduler = this.newsScheduler.bind(this)
  }

  async scrapper(page: number = 1, end: string | null = null) {
    loggerService.info(`Start scraping page ${page}`)
    const response = await axios.get(
      `${env.NEWS_URL}${page > 1 ? `?page=${page}` : ''}`
    )

    const html = response.data
    const $ = load(html)
    loggerService.info(`Found ${$('div.post').length} articles`)
    const articles = await Promise.all(
      $('div.post')
        .toArray()
        .map(async (el) => {
          const card = $(el)
          const title = card.find('div.post-title h4').text().trim()
          const subtitle = card.find('div.post-excerpt p').text().trim()
          const reference = card
            .find('figure.post-gallery a')
            .attr('href')
            ?.trim()

          loggerService.info(`Processing article: ${title}`)

          // Extract image
          const imgElement = card.find('figure.post-gallery a img')
          let image = imgElement.attr('src')
          const dataSrcset = imgElement.attr('data-srcset')

          if (dataSrcset) {
            const srcsetItems = dataSrcset
              .split(',')
              .map((item) => item.trim().split(' '))
            image =
              srcsetItems.find(([url]) => url!.includes('740x494.jpg'))?.[0] ||
              srcsetItems.at(-1)?.[0]
          }

          // Fetch full article content
          const articleData = reference
            ? await this.getArticleContent(reference)
            : null

          return {
            title,
            subtitle,
            image,
            reference,
            content: articleData?.content || '',
            author: articleData?.author || 'Unknown',
            createdAt: articleData?.createdAt || new Date()
          }
        })
    )
    loggerService.info(`Finished scraping page ${page}`)
    if (end) {
      let finished = false
      return articles.filter((article) => {
        if (article.title === end) finished = true
        return !finished
      })
    }

    return articles
  }

  async getArticleContent(reference: string) {
    try {
      const res = await axios.get(reference)
      const $ = load(res.data)

      return {
        author: $('.author-and-date > .post-author').text().trim(),
        createdAt: new Date(
          $('.author-and-date > .thb-post-date').text().trim()
        ),
        content: $('div.post-content.entry-content').html()
      }
    } catch (err) {
      loggerService.error(`Error getting article content: ${err}`)
      return null
    }
  }

  async newsScheduler(limit: number = 30) {
    loggerService.info('Running news scheduler...')
    let savedNewsCount = 0

    const latestTitle = await NewsModel.findOne({}).sort({ createdAt: -1 })
    loggerService.info(`Latest title is ${latestTitle?.title}`)

    const news = await this.scrapper(1, latestTitle?.title)
    loggerService.info(`Scrapped ${news.length} news`)
    for (let i = 0; i < news.length; i++) {
      if (savedNewsCount >= limit) break
      const article = news[i]
      if (!article?.reference) {
        loggerService.info('Skipping article without reference')
        continue
      }
      const existingArticle = await NewsModel.findOne({
        reference: article.reference
      })
      if (!existingArticle) {
        await this.create(
          {
            author: article.author,
            title: article.title,
            subtitle: article.subtitle,
            image: article.image!,
            reference: article.reference,
            content: article.content
          },
          {
            actor: getActorData()
          }
        )
        savedNewsCount++
        loggerService.info(`Saved ${savedNewsCount} news`)
      }
    }
    loggerService.info(`News scheduler finished, saved ${savedNewsCount} news`)
  }

  async removeOldNews() {
    const expireDate = moment()
      .subtract(env.NEWS_RETENTION_PERIOD_IN_DAYS, 'days')
      .toDate()

    return await NewsModel.deleteMany({ createdAt: { $lt: expireDate } })
  }
}

export const newsService = new NewsService()
