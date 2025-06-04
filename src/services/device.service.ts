import { CreateDeviceDto, IDeviceDocument } from '@contracts'
import { DeviceModel } from '@models'

import { BaseService } from './base.service'

export class DeviceService extends BaseService<
  IDeviceDocument,
  CreateDeviceDto
> {
  constructor() {
    super(DeviceModel)
  }
}

export const deviceService = new DeviceService()
