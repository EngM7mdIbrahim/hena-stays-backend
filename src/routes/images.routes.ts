import { FILES_ENDPOINTS } from '@commonTypes'
import { uploadImageController } from '@controllers'
import { Router } from 'express'
import multer from 'multer'

import { asyncWrapper } from '@utils'

const upload = multer({ storage: multer.memoryStorage() })

const router = Router()

router.post(
  FILES_ENDPOINTS.UPLOAD,
  upload.single('image'),
  asyncWrapper(uploadImageController.uploadImage)
)

export default router
