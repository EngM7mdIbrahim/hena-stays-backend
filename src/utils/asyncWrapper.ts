import { NextFunction, Request, Response } from 'express'

type AsyncHandler = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => Promise<any>

export function asyncWrapper(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
