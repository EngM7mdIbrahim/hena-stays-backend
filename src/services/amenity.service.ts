import { CreateAmenityDto, IAmenityDocument } from '@contracts'
import { AmenityModel } from '@models'

import { BaseService } from './base.service'

class AmenityService extends BaseService<IAmenityDocument, CreateAmenityDto> {
  constructor() {
    super(AmenityModel)
  }
}

export const amenityService = new AmenityService()
