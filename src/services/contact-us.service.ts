import { CreateContactUsDto, IContactUsDocument } from '@contracts'
import { ContactUsModel } from '@models'

import { BaseService } from './base.service'

class ContactUsService extends BaseService<
  IContactUsDocument,
  CreateContactUsDto
> {
  constructor() {
    super(ContactUsModel)
  }
}
export const contactUsService = new ContactUsService()
