import {
  ActionToTakeTypes,
  FindAllNewsRequestQuery,
  FindAllNewsResponse,
  FindNewsRequestParams,
  FindNewsResponse,
  News
} from '@commonTypes'
import { newsService } from '@services'
import { Request, Response } from 'express'

import { getPaginationData, sendSuccessResponse, serializeDto } from '@utils'

class NewsController {
  async getAll(
    req: Request<any, any, any, FindAllNewsRequestQuery>,
    res: Response<FindAllNewsResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const news = await newsService.findAll(filter, {
      limit,
      page,
      sort
    })
    sendSuccessResponse(res, {
      items: news.results.map((news) => serializeDto<News>(news)),
      total: news.totalResults,
      limit,
      page,
      totalPages: news.totalPages,
      hasNext: news.page < news.totalPages,
      nextPage: news.page < news.totalPages ? news.page + 1 : undefined
    })
  }

  async getOne(
    req: Request<FindNewsRequestParams>,
    res: Response<FindNewsResponse>
  ) {
    const news = await newsService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { news: serializeDto<News>(news!) })
  }
}

export const newsController = new NewsController()
