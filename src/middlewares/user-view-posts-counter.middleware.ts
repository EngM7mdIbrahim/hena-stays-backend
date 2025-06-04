import {
  communityInteractionsService,
  loggerService,
  userViewPostsService
} from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData } from '@utils'

export const userViewPostInteractionsCounterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id

    if (!postId) {
      return next()
    }

    const interaction = await communityInteractionsService.readOne({
      post: postId
    })
    if (!interaction) {
      await communityInteractionsService.create(
        {
          post: postId,
          views: 1,
          visitors: 1,
          impressions: 1,
          saves: 0
        },
        {
          actor: getActorData()
        }
      )
    }
    // Increment views
    let interacted = false
    if (req.user) {
      const existingUserViewPosts = await userViewPostsService.readOne({
        post: postId,
        user: req.user._id
      })
      interacted = Boolean(existingUserViewPosts)
      if (!interacted) {
        await userViewPostsService.create(
          {
            post: postId,
            user: String(req.user._id),
            views: 1
          },
          {
            actor: getActorData()
          }
        )
      } else {
        existingUserViewPosts!.views += 1
        await existingUserViewPosts!.save()
      }
    }

    next()
  } catch (error: Error | any) {
    loggerService.error(error.message)
    next()
  }
}
