import { PROPERTIES_XML_ENDPOINTS, UserRole } from '@commonTypes'
import { propertiesXMLController } from '@controllers'
import { authMiddleware, validateMiddleware, validateRole } from '@middlewares'
import {
  AddPropertyXMLValidation,
  AdminApprovementValidation,
  GetOneXmlPropertyValidation,
  PublishPropertyXMLValidation,
  UpdateAgentEmailValidation
} from '@schema'
import { Router } from 'express'

import { asyncWrapper } from '@utils'

const router = Router()

router.use(authMiddleware)

router.post(
  PROPERTIES_XML_ENDPOINTS.CREATE,
  validateRole(UserRole.Company, UserRole.Broker, UserRole.CompanyAdmin),
  validateMiddleware(AddPropertyXMLValidation),
  asyncWrapper(propertiesXMLController.addXmlProperties)
)

router.post(
  PROPERTIES_XML_ENDPOINTS.PUBLISH,
  validateRole(
    UserRole.Company,
    UserRole.Broker,
    UserRole.CompanyAdmin,
    UserRole.Admin,
    UserRole.AdminViewer
  ),
  validateMiddleware(PublishPropertyXMLValidation),
  asyncWrapper(propertiesXMLController.publishXmlProperties)
)

router.patch(
  PROPERTIES_XML_ENDPOINTS.ADMIN_APPROVEMENT,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  validateMiddleware(AdminApprovementValidation, true),
  asyncWrapper(propertiesXMLController.adminApprovement)
)

router.patch(
  PROPERTIES_XML_ENDPOINTS.UPDATE_AGENT_EMAIL,
  validateRole(UserRole.Company, UserRole.Broker, UserRole.CompanyAdmin),
  validateMiddleware(UpdateAgentEmailValidation, true),
  asyncWrapper(propertiesXMLController.updateAgentEmail)
)

router.get(
  PROPERTIES_XML_ENDPOINTS.GET_ALL,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  asyncWrapper(propertiesXMLController.getAllXmlProperties)
)

router.get(
  PROPERTIES_XML_ENDPOINTS.GET_ONE,
  validateRole(UserRole.Admin, UserRole.AdminViewer),
  validateMiddleware(GetOneXmlPropertyValidation, true),
  asyncWrapper(propertiesXMLController.getOneXmlProperty)
)

export default router
