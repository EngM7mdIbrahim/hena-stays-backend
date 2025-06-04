import {
  ActionToTakeTypes,
  Config,
  GetConfigResponse,
  UpdateConfigRequestBody,
  UpdateConfigResponse
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { configsService } from '@services'
import { NextFunction, Request, Response } from 'express'

import { getActorData, sendSuccessResponse, serializeDto } from '@utils'

class ConfigController {
  async getConfig(req: Request, res: Response<GetConfigResponse>) {
    const config = await configsService.readOne(
      {},
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { config: serializeDto<Config>(config) })
  }
  async updateConfig(
    req: Request<any, UpdateConfigResponse, UpdateConfigRequestBody>,
    res: Response<UpdateConfigResponse>
  ) {
    await configsService.readOne(
      {},
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const config = await configsService.update({}, req.body, {
      actor: getActorData(req)
    })
    sendSuccessResponse(res, { config: serializeDto<Config>(config) })
  }
  async createConfig(req: Request, res: Response, next: NextFunction) {
    const checkForConfig = await configsService.readOne({}, {})
    if (checkForConfig) {
      return next(new AppError(MESSAGES.CONFIG.CREATION_ERROR, 400))
    }
    const config = await configsService.create(req.body, {
      actor: getActorData(req)
    })
    sendSuccessResponse(res, { config: serializeDto<Config>(config) })
  }
}

export const configController = new ConfigController()
