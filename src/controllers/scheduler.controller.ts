import { xmlUserPropertyCombinedService } from '@combinedServices'
import {
  SCHEDULER_TASKS,
  SchedulerResponseBody,
  SchedulerTaskReport
} from '@commonTypes'
import {
  dbBackupService,
  entityLogService,
  newsService,
  officialBlogService,
  propertyService
} from '@services'
import { Request, Response } from 'express'

import { safeExecTask, sendSuccessResponse } from '@utils'

class SchedulerController {
  async dailyScheduler(_req: Request, res: Response<SchedulerResponseBody>) {
    const report: SchedulerTaskReport[] = []
    await safeExecTask(
      SCHEDULER_TASKS.NEWS_SCRAPPER,
      newsService.newsScheduler,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.PROPERTY_RECOMMENDATIONS,
      propertyService.updateExpiredRecommendations,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.DB_BACKUP,
      dbBackupService.dbBackup,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.NEWS_CLEANUP,
      newsService.removeOldNews,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.LOGS_CLEANUP,
      entityLogService.removeOldLogs,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.PROPERTIES_XML_UPDATE,
      xmlUserPropertyCombinedService.xmlScheduler,
      report
    )
    await safeExecTask(
      SCHEDULER_TASKS.PUBLISH_SCHEDULED_OFFICIAL_BLOGS,
      officialBlogService.publishScheduledBlogs,
      report
    )
    const success = report.every((task) => task.status === 'success')
    return sendSuccessResponse(
      res,
      {
        success,
        report
      },
      success ? 200 : 500
    )
  }
}

export const schedulerController = new SchedulerController()
