import { LoggedInModes } from '@commonTypes'
import { RequestHandler } from 'express'

type WithError<T> = T & { error: string }

export type ExpressHandler<Req, Res> = RequestHandler<
  string,
  Partial<WithError<Res>>,
  Partial<Req>,
  any
>

export type ExpressHandlerWithParams<Params, Req, Res> = RequestHandler<
  Partial<Params>,
  Partial<WithError<Res>>,
  Partial<Req>,
  any
>

export interface JwtObject {
  id: string
  mode: (typeof LoggedInModes)[keyof typeof LoggedInModes]
}
