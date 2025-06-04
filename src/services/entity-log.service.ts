// this is the only service without extending the base model, because base service uses this entity model
import { env } from '@config'
import { EntityLogModel } from '@models'
import moment from 'moment'

class EntityLogService {
  constructor() {}

  async removeOldLogs() {
    const expireDate = moment()
      .subtract(env.LOGS_RETENTION_PERIOD_IN_DAYS, 'days')
      .toDate()

    return await EntityLogModel.deleteMany({ createdAt: { $lt: expireDate } })
  }
}

export const entityLogService = new EntityLogService()
