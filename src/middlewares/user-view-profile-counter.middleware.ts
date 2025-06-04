import { profileInteractionsService, userViewUsersService } from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData } from '@utils'

export const userViewUserInteractionsCounterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userViewedId = req.params.id

  if (!userViewedId) {
    return next()
  }

  const interaction = await profileInteractionsService.readOne({
    user: userViewedId
  })
  if (!interaction) {
    await profileInteractionsService.create(
      {
        user: userViewedId,
        views: 1,
        visitors: 1
      },
      {
        actor: getActorData()
      }
    )
    await userViewUsersService.create(
      {
        userViewed: userViewedId,
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
    const existingUserViewUsers = await userViewUsersService.readOne({
      userViewed: userViewedId,
      user: req.user._id
    })
    interacted = Boolean(existingUserViewUsers)
    if (!interacted) {
      await userViewUsersService.create(
        {
          userViewed: userViewedId,
          user: String(req.user._id),
          views: 1
        },
        {
          actor: getActorData()
        }
      )
    } else {
      existingUserViewUsers!.views += 1
      await existingUserViewUsers!.save()
    }
  }

  return next()
}
