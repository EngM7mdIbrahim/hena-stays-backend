import { GOOGLE_ENDPOINTS } from '@commonTypes'
import { googleController } from '@controllers'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.get(
  GOOGLE_ENDPOINTS.PLACE_SEARCH,
  asyncWrapper(googleController.searchPlace)
)
router.get(
  GOOGLE_ENDPOINTS.PLACE_DETAILS,
  asyncWrapper(googleController.getPlaceDetails)
)
const googleRouter = router
export default googleRouter
