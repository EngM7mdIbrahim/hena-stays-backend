import { APP_ENV } from '@commonTypes'
import * as Sentry from '@sentry/node'

import { env } from '../config'

export function initSentry() {
  if (env.SENTRY_DSN) {
    const sentry = Sentry.init({
      dsn: env.SENTRY_DSN,
      sendDefaultPii: true,
      environment: env.APP_ENV,
      enabled: env.APP_ENV === APP_ENV.PROD
    })

    return sentry
  }
}
