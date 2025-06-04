import { projectInteractionsService, userViewProjectsService } from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData } from '@utils'

export const userViewProjectInteractionsCounterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = req.params.id

  if (!projectId) {
    return next()
  }

  const interaction = await projectInteractionsService.readOne({
    project: projectId
  })
  if (!interaction) {
    await projectInteractionsService.create(
      {
        project: projectId,
        views: 1,
        visitors: 1,
        impressions: 1
      },
      {
        actor: getActorData()
      }
    )
    await userViewProjectsService.create(
      {
        project: projectId,
        user: String(req.user?._id),
        views: 1
      },
      {
        actor: getActorData()
      }
    )
    return next()
  }
  // Increment views
  let interacted = false
  if (req.user) {
    const existingUserViewProjects = await userViewProjectsService.readOne({
      project: projectId,
      user: req.user._id
    })
    interacted = Boolean(existingUserViewProjects)
    if (!interacted) {
      await userViewProjectsService.create(
        {
          project: projectId,
          user: String(req.user._id),
          views: 1
        },
        {
          actor: getActorData()
        }
      )
    } else {
      existingUserViewProjects!.views += 1
      await existingUserViewProjects!.save()
    }
  }

  return next()
}
