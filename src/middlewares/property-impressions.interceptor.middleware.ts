import { GetAllPropertiesResponse } from '@commonTypes'
import { interactionsService } from '@services'
import { Request, Response } from 'express'

import { getActorData } from '@utils'

export const propertyImpressionsInterceptor = async (
  req: Request,
  res: Response
) => {
  if (!req.query.savedByMe && !req.query.mine) {
    const properties: GetAllPropertiesResponse['items'] = res.locals.properties
    for (const property of properties) {
      const interaction = await interactionsService.readOne({
        property: property._id
      })
      if (!interaction) {
        await interactionsService.create(
          {
            property: property._id,
            impressions: 1,
            views: 0,
            visitors: 0,
            saves: 0,
            leadClicks: {
              phone: 0,
              whatsapp: 0,
              email: 0,
              chat: 0
            }
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
