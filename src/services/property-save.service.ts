import { CreatePropertySaveDto, IPropertySaveDocument } from '@contracts'
import { PropertySaveModel } from '@models'
import { BaseService } from '@services'

class PropertySaveService extends BaseService<
  IPropertySaveDocument,
  CreatePropertySaveDto
> {
  constructor() {
    super(PropertySaveModel)
  }
}

export const propertySaveService = new PropertySaveService()
