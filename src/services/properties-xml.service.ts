import { PropertyXMLStatus } from '@commonTypes'
import { CreatePropertiesXMLDto, IPropertiesXMLDocument } from '@contracts'
import { PropertiesXMLModel } from '@models'

import { BaseService } from './base.service'

export class PropertiesXMLService extends BaseService<
  IPropertiesXMLDocument,
  CreatePropertiesXMLDto
> {
  constructor() {
    super(PropertiesXMLModel)
  }

  async updateXMLEntityStatus(entityId: string) {
    const propertiesXML = (await PropertiesXMLModel.findById(entityId))!

    const isPropertiesEligible = propertiesXML.tempProperties
      ?.map(({ properties }) => properties)
      .flat()
      .every(({ isEligible }) => isEligible)

    const isAgentsApprovalIssues = propertiesXML.tempProperties
      ?.map(({ approvalIssues }) => approvalIssues)
      .filter(Boolean)
      .every((issues) => issues.length === 0)

    const isEligible = isPropertiesEligible && isAgentsApprovalIssues

    if (isEligible) {
      propertiesXML.status = PropertyXMLStatus.Approved
    } else {
      propertiesXML.status = PropertyXMLStatus.PendingApproval
    }
    return propertiesXML.save()
  }
}

export const propertiesXMLService = new PropertiesXMLService()
