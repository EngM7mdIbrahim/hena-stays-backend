import http from 'http'
import {
  APP_ENV,
  GENERAL_ENDPOINTS,
  SocketClientToServerMap,
  SocketServerToClientMap
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError, SocketData } from '@contracts'
import { globalErrorHandler } from '@middlewares'
import appRouter from '@routes'
import compression from 'compression'
import cors from 'cors'
import express, { NextFunction, Request, Response, type Express } from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'

import 'express-async-errors'

import { env } from 'process'
import * as Sentry from '@sentry/node'
import { loggerService } from '@services'
import { Server } from 'socket.io'

import { initializeSocket } from './socket.loader'

export const loadServer = (): { app: Express; server: http.Server } => {
  const app = express()
  const server = http.createServer(app)
  const io = new Server<
    SocketClientToServerMap,
    SocketServerToClientMap,
    any,
    SocketData
  >(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  initializeSocket(io)

  app
    .disable('x-powered-by')
    .use(helmet())
    .use(compression())
    .use(mongoSanitize())
    .use(hpp())
    .set('trust proxy', 1) // trust first proxy
    .use(
      rateLimit({
        max: 15000,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour!',
        standardHeaders: true,
        legacyHeaders: false
      })
    )
    .use(
      express.json({
        limit: '50mb',
        verify: function (req: Request, res: Response, buf: Buffer) {
          req.rawBody = buf
        }
      })
    )
    .use(express.urlencoded({ extended: true, limit: '50mb' }))
    .use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
      )
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      )
      res.header('Access-Control-Allow-Credentials', 'true')
      if (req.method === 'OPTIONS') {
        res.sendStatus(200)
        return
      }
      next()
    })
    .use(
      cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization'
        ]
      })
    )
    .get('/', (_req: Request, res: Response) => {
      loggerService.log('Received Hello World request')
      res.send('Hello from the backend!')
    })
  app.use(GENERAL_ENDPOINTS.BASE_API_URL, appRouter)
  app.get('/test', (_req: Request, _res: Response) => {
    throw new Error('Test error')
  })
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    return next(new AppError(MESSAGES.notFound('route ' + req.url), 404))
  })
  if (env.SENTRY_DSN && env.APP_ENV === APP_ENV.PROD) {
    Sentry.setupExpressErrorHandler(app)
    loggerService.info(
      `Sentry is enabled with DSN: ${env.SENTRY_DSN}, and environment: ${env.APP_ENV}, it will capture all errors in the app`
    )
  } else {
    if (env.APP_ENV === APP_ENV.PROD) {
      loggerService.warn(
        'Development environment detected, skipping error handler setup'
      )
    } else {
      loggerService.warn('Sentry DSN not found, skipping error handler setup')
    }
  }
  app.use(globalErrorHandler)
  return { app, server }
}
