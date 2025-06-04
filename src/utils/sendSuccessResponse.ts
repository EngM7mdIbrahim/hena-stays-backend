import { loggerService } from '@services'
import { Request, Response } from 'express'

export async function sendSuccessResponse<T>(
  res: Response<T>,
  data: T,
  code: number = 200,
  req?: Request
) {
  if (req?.dbSession?.transaction?.isActive) {
    loggerService.debug(
      'There is an active transaction, committing changes ...'
    )
    await req.dbSession.commitTransaction()
    await req.dbSession.endSession()
  }
  return res.status(code).json(data)
}
