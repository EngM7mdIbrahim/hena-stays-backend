import { createDefaultAmenities } from './amenities.loader'
import {
  createDefaultCategories,
  createDefaultSubCategories
} from './categories.loader'
import { checkAndLoadDefaultConfig } from './config.loader'
import { loadDBConnection } from './db-connection.loader'
import { loadServer } from './express.loader'
import { checkAndLoadDefaultSupportUser } from './info-user.loader'
import { initSentry } from './sentry.loader'

export default async function loadApp() {
  await loadDBConnection()
  await checkAndLoadDefaultSupportUser()
  await createDefaultAmenities()
  await createDefaultCategories()
  await createDefaultSubCategories()
  await checkAndLoadDefaultConfig()
  initSentry()
  return loadServer()
}
