import { env } from '@config'
import loadApp from '@loaders'
import { loggerService } from '@services'

async function startApp() {
  const { server } = await loadApp()
  server.listen(env.APP_PORT, () => {
    loggerService.log(`API running on port ${env.APP_PORT}`)
  })
}

startApp()
