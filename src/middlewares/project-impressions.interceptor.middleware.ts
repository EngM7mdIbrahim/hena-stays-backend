import { GetAllProjectsResponse } from '@commonTypes'
import { projectInteractionsService } from '@services'
import { Request, Response } from 'express'

import { getActorData } from '@utils'

export const projectImpressionsInterceptor = async (
  req: Request,
  res: Response
) => {
  if (!req.query.savedByMe && !req.query.mine) {
    const projects: GetAllProjectsResponse['items'] = res.locals.projects
    for (const project of projects) {
      const projectInteraction = await projectInteractionsService.readOne({
        project: project._id
      })
      if (!projectInteraction) {
        await projectInteractionsService.create(
          {
            project: project._id,
            impressions: 1,
            views: 0,
            visitors: 0
          },
          {
            actor: getActorData()
          }
        )
        continue
      }
      projectInteraction.impressions += 1
      await projectInteraction.save()
    }
  }
  return
}
