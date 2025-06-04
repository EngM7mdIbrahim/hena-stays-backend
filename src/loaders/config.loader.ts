/**
 * @description
 * Config loader
 *
 * @file loaders/config.loader.ts
 * @todo
 * - Add config loader with default values
 */

import { configsService, loggerService } from '@services'

import { getActorData } from '@utils'

const DEFAULT_CONFIG = {
  propertyRecommendations: {
    hot: [
      {
        price: 75,
        noExpireDays: 7
      },
      {
        price: 150,
        noExpireDays: 14
      },
      {
        price: 225,
        noExpireDays: 30
      }
    ],
    propertyOfWeek: [
      {
        price: 600,
        noExpireDays: 7
      }
    ],
    signature: [
      {
        price: 100,
        noExpireDays: 7
      },
      {
        price: 200,
        noExpireDays: 14
      },
      {
        price: 300,
        noExpireDays: 30
      }
    ]
  },
  creditsPrice: 1.9
}

export const checkAndLoadDefaultConfig = async () => {
  try {
    const config = await configsService.readOne({}, {})

    if (!config) {
      loggerService.info(
        'No configuration found. Creating default configuration...'
      )
      await configsService.create(DEFAULT_CONFIG, {
        actor: getActorData()
      })
      loggerService.info('Default configuration created successfully')
      return DEFAULT_CONFIG
    }

    loggerService.info('Configuration loaded successfully')
    return config
  } catch (error) {
    loggerService.error(`Error loading configuration: ${error}`)
    throw error
  }
}
