import { CreateCompanyDto, ICompanyDocument } from '@contracts'
import { CompanyModel } from '@models'

import { BaseService } from './base.service'

class CompanyService extends BaseService<ICompanyDocument, CreateCompanyDto> {
  constructor() {
    super(CompanyModel)
  }
}

export const internalCompanyService = new CompanyService()
export const companyService: Omit<CompanyService, 'delete' | 'deleteMany'> =
  internalCompanyService
