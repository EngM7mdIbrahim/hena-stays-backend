import { Request } from 'express'

export const getLoggedInUserId = (req: Request<any, any, any, any>) => {
  return req.user?._id.toString() as string
}
