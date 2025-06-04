import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { interactionsService, userViewsPropertiesService } from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData } from '@utils'

export const interactionsCounterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyId = req.params.id

    if (!propertyId) {
      return next()
    }

    const interaction = await interactionsService.readOne({
      property: propertyId
    })
    if (!interaction) {
      return next()
    }
    // Increment views
    let interacted = false
    if (req.user) {
      const existingUserViewProperty = await userViewsPropertiesService.readOne(
        {
          property: propertyId,
          user: req.user._id
        }
      )
      interacted = Boolean(existingUserViewProperty)
      if (!interacted) {
        await userViewsPropertiesService.create(
          {
            property: propertyId,
            user: String(req.user._id),
            views: 1
          },
          {
            actor: getActorData()
          }
        )
      } else {
        existingUserViewProperty!.views += 1
        await existingUserViewProperty!.save()
      }
    }

    next()
  } catch (error: Error | any) {
    next(
      new AppError(
        error?.message || MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR,
        500
      )
    )
  }
}
