import { GetAllPropertiesResponse } from '@commonTypes'
import { communityInteractionsService } from '@services'
import { Request, Response } from 'express'

import { getActorData } from '@utils'

export const postImpressionsInterceptor = async (
  req: Request,
  res: Response
) => {
  if (!req.query.savedByMe && !req.query.mine) {
    const properties: GetAllPropertiesResponse['items'] = res.locals.posts
    for (const post of properties) {
      const interaction = await communityInteractionsService.readOne({
        post: post._id
      })
      if (!interaction) {
        await communityInteractionsService.create(
          {
            post: post._id,
            impressions: 1,
            views: 0,
            visitors: 0,
            saves: 0
          },
          {
            actor: getActorData()
          }
        )
        continue
      }
      interaction.impressions += 1
      await interaction.save()
    }
  }
  return
}
