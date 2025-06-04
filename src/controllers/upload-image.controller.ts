import { UploadImageResponse } from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { uploadImageService } from '@services'
import { NextFunction, Request, Response } from 'express'

import { sendSuccessResponse } from '@utils'

class UploadImageController {
  async uploadImage(
    req: Request,
    res: Response<UploadImageResponse>,
    next: NextFunction
  ) {
    const file = req.file
    if (!file) {
      next(new AppError(MESSAGES.IMAGES.NO_FILE, 400))
    }
    const result = await uploadImageService.uploadSingleImage(file, new Date())
    return await sendSuccessResponse(res, result)
  }
}

export const uploadImageController = new UploadImageController()
