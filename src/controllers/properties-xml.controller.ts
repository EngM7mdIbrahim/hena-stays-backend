import { xmlUserPropertyCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  AddPropertyXMLBody,
  AddPropertyXMLResponse,
  AdminApprovementBody,
  AdminApprovementResponse,
  GetAllXmlPropertiesQuery,
  GetAllXmlPropertiesResponse,
  GetXmlPropertyParams,
  GetXmlPropertyResponse,
  PropertiesXML,
  PropertyValidatorModes,
  PropertyXMLStatus,
  PublishPropertyXMLBody,
  PublishPropertyXMLResponse,
  UpdateAgentEmailBody,
  UpdateAgentEmailParams,
  UpdateAgentEmailResponse,
  User,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IPropertiesXMLDocument,
  IUserDocument,
  PopulatedPropertiesXMLDocument
} from '@contracts'
import {
  emailService,
  loggerService,
  propertiesXmlParserService,
  propertiesXMLService,
  userService,
  xmlManagerService
} from '@services'
import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

async function getXmlUserData(user: IUserDocument) {
  if (
    !user ||
    ![UserRole.Broker, UserRole.Company, UserRole.CompanyAdmin].includes(
      user.role as
        | typeof UserRole.Broker
        | typeof UserRole.Company
        | typeof UserRole.CompanyAdmin
    )
  ) {
    throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 401)
  }
  // In case of company admin, we need to get the company user
  if (user.company && user.role !== UserRole.Company) {
    return await userService.readOne({
      company: user.company,
      role: UserRole.Company
    })
  }
  // else this is the company user
  return user
}

class PropertiesXMLController {
  async addXmlProperties(
    req: Request<any, AddPropertyXMLResponse, AddPropertyXMLBody>,
    res: Response<AddPropertyXMLResponse>,
    next: NextFunction
  ) {
    const { url } = req.body
    const currentUser = await getXmlUserData(req.user!)
    if (!currentUser) {
      return next(new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 401))
    }
    let propertiesXmlEntity: IPropertiesXMLDocument | null =
      await propertiesXMLService.readOne({
        url,
        status: { $ne: PropertyXMLStatus.Rejected }
      })
    if (
      propertiesXmlEntity &&
      propertiesXmlEntity?.creator.toString() !== currentUser._id.toString()
    ) {
      throw new AppError(
        MESSAGES.PROPERTY_XML.URL_EXISTS_WITH_ANOTHER_USER,
        400
      )
    }
    if (
      propertiesXmlEntity &&
      propertiesXmlEntity?.creator.toString() === currentUser._id.toString() &&
      propertiesXmlEntity?.status !== PropertyXMLStatus.Pending
    ) {
      throw new AppError(MESSAGES.PROPERTY_XML.URL_EXISTS, 400)
    }

    const currentPlatformAdapter = propertiesXmlParserService.getAdapter(url)
    if (!currentPlatformAdapter) {
      throw new AppError(MESSAGES.invalid('url'), 400)
    }
    if (!propertiesXmlEntity) {
      propertiesXmlEntity = await propertiesXMLService.create(
        {
          url,
          status: PropertyXMLStatus.Pending,
          lastUpdatedAt: moment().toDate(),
          creator: currentUser!._id.toString()
        },
        { actor: getActorData() }
      )
    }
    const xmlString = await xmlManagerService.fetch(url)
    const parsedJSONFromXML = await xmlManagerService.parse(xmlString)
    const {
      agents: parsedAgents,
      warnings: parsedWarnings,
      generalErrors: parsedGeneralErrors
    } = propertiesXmlParserService.parse(
      parsedJSONFromXML,
      currentPlatformAdapter
    )

    const {
      agents: parsedAgentsWithDB,
      warnings: parsedWarningsWithDB,
      generalErrors: parsedGeneralErrorsWithDB
    } = await xmlUserPropertyCombinedService.dbMapper(
      parsedAgents,
      parsedWarnings,
      parsedGeneralErrors
    )
    const validatedAgents = await xmlUserPropertyCombinedService.validateAgents(
      parsedAgentsWithDB,
      currentUser,
      currentUser.role as typeof UserRole.Broker | typeof UserRole.Company,
      PropertyValidatorModes.User
    )
    await propertiesXMLService.update(
      { _id: propertiesXmlEntity._id },
      {
        originalParsedProperties: parsedAgents,
        tempProperties: validatedAgents,
        warnings: parsedWarningsWithDB,
        xmlErrors: parsedGeneralErrorsWithDB,
        lastUpdatedAt: moment(parsedJSONFromXML.last_update as string).toDate()
      },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(
      res,
      {
        id: propertiesXmlEntity._id.toString(),
        lastUpdatedAt: propertiesXmlEntity.lastUpdatedAt.toISOString(),
        agents: validatedAgents,
        warnings: parsedWarningsWithDB,
        generalErrors: parsedGeneralErrorsWithDB
      },
      201
    )
  }

  async publishXmlProperties(
    req: Request<any, PublishPropertyXMLResponse, PublishPropertyXMLBody>,
    res: Response<PublishPropertyXMLResponse>
  ) {
    const { id } = req.body
    const propertiesXML =
      (await propertiesXMLService.readOne<PopulatedPropertiesXMLDocument>(
        { _id: id },
        {
          throwErrorIf: ActionToTakeTypes.NotFound,
          populateFields: ['creator']
        }
      ))!
    const currentUser = (await getXmlUserData(req.user!))!
    if (
      propertiesXML.creator._id.toString() !== currentUser._id.toString() &&
      currentUser.role !== UserRole.Admin
    ) {
      throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 401)
    }

    const tempProperties = propertiesXML.tempProperties
    for (let i = 0; i < tempProperties!.length; i++) {
      const agent = tempProperties![i]
      try {
        await xmlUserPropertyCombinedService.publisher(agent, currentUser)
      } catch (error) {
        loggerService.error(
          `Skipping publishing agent: ${agent.email} due to error: ${error}`
        )
      }
    }
    await propertiesXMLService.updateXMLEntityStatus(id)
    await emailService.propertiesXmlImportedEmail(
      propertiesXML.creator.email,
      propertiesXML.creator.name,
      propertiesXML.url
    )
    return sendSuccessResponse(
      res,
      {
        message: 'Properties published successfully'
      },
      200
    )
  }

  async updateAgentEmail(
    req: Request<
      UpdateAgentEmailParams,
      UpdateAgentEmailResponse,
      UpdateAgentEmailBody
    >,
    res: Response<UpdateAgentEmailResponse>
  ) {
    let { previousAgentEmail, newAgentEmail } = req.body
    const { id } = req.params
    previousAgentEmail = previousAgentEmail.toLowerCase().trim()
    newAgentEmail = newAgentEmail.toLowerCase().trim()
    if (previousAgentEmail === newAgentEmail) {
      throw new AppError('Emails cannot be the same', 400)
    }
    const currentUser = await getXmlUserData(req.user!)
    if (!currentUser) {
      throw new AppError(MESSAGES.AUTH.RESTRICTION_MESSAGE, 401)
    }
    // Get XML entity and do the checking
    const currentXMLEntity = (await propertiesXMLService.readOne(
      {
        _id: id,
        creator: currentUser._id
      },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    ))!

    // Get originalParsedProperties from XML entity
    const originalParsedProperties = currentXMLEntity.originalParsedProperties
    if (!originalParsedProperties) {
      loggerService.error(
        `No originalParsedProperties found for XML entity ${id} requested by user ${currentUser.email}`
      )
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }

    // Check if there is no agent with the previousAgentEmail, throw an error
    let indexOfPreviousAgentEmail = -1
    const prevAgent = originalParsedProperties.find((item, i) => {
      if (item.email === previousAgentEmail) {
        indexOfPreviousAgentEmail = i
        return true
      }
      return false
    })
    if (!prevAgent) {
      throw new AppError('There is no agent with the previousAgentEmail', 400)
    }

    // If newAgentEmail exists, add the previous agent properties to the new agent
    const newAgent = originalParsedProperties!.find(
      (item) => item.email === newAgentEmail
    )
    if (newAgent) {
      newAgent.properties = [...newAgent.properties, ...prevAgent.properties]
      originalParsedProperties.splice(indexOfPreviousAgentEmail, 1)
    } else {
      const exists = await userService.readOne({ email: newAgentEmail })
      originalParsedProperties[indexOfPreviousAgentEmail].email = newAgentEmail
      originalParsedProperties[indexOfPreviousAgentEmail].name =
        exists?.name || originalParsedProperties[indexOfPreviousAgentEmail].name
      originalParsedProperties[indexOfPreviousAgentEmail].phone =
        exists?.phone ||
        originalParsedProperties[indexOfPreviousAgentEmail].phone
      originalParsedProperties[indexOfPreviousAgentEmail].photo = exists
        ? exists?.image
          ? {
              url: exists?.image,
              type: 'image'
            }
          : null
        : originalParsedProperties[indexOfPreviousAgentEmail].photo
    }

    // Run the validator on the newTempProperties
    const {
      agents: parsedAgentsWithDB,
      warnings: parsedWarningsWithDB,
      generalErrors: parsedGeneralErrorsWithDB
    } = await xmlUserPropertyCombinedService.dbMapper(
      originalParsedProperties,
      currentXMLEntity.warnings || {},
      currentXMLEntity.xmlErrors || []
    )
    const validatedAgents = await xmlUserPropertyCombinedService.validateAgents(
      parsedAgentsWithDB,
      currentUser,
      currentUser.role as typeof UserRole.Broker | typeof UserRole.Company,
      PropertyValidatorModes.User
    )

    // Save the newTempProperties to the XML entity
    await propertiesXMLService.update(
      { _id: id },
      {
        originalParsedProperties: originalParsedProperties,
        tempProperties: validatedAgents,
        warnings: parsedWarningsWithDB,
        errors: parsedGeneralErrorsWithDB
      },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(
      res,
      {
        id: currentXMLEntity._id.toString(),
        lastUpdatedAt: currentXMLEntity.lastUpdatedAt.toISOString(),
        agents: validatedAgents,
        warnings: parsedWarningsWithDB,
        generalErrors: parsedGeneralErrorsWithDB
      },
      200
    )
  }

  async adminApprovement(
    req: Request<
      GetXmlPropertyParams,
      AdminApprovementResponse,
      AdminApprovementBody
    >,
    res: Response<AdminApprovementResponse>
  ) {
    const { id } = req.params
    const { status, message } = req.body
    const propertyXML =
      (await propertiesXMLService.readOne<PopulatedPropertiesXMLDocument>(
        { _id: id },
        {
          populateFields: ['creator'],
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      ))!
    if (status === PropertyXMLStatus.Rejected) {
      if (!message) {
        throw new AppError(MESSAGES.required('message'), 400)
      }
      await propertiesXMLService.update(
        { _id: id },
        {
          status: PropertyXMLStatus.Rejected,
          rejectionReason: message
        },
        {
          actor: getActorData(req)
        }
      )
      await emailService.sendPropertiesXmlRejectedEmail(
        propertyXML.creator.email,
        propertyXML.creator.name,
        propertyXML.url,
        message
      )
      return sendSuccessResponse(
        res,
        {
          email: propertyXML.creator.email,
          name: propertyXML.creator.name,
          url: propertyXML.url,
          message
        },
        200
      )
    }
    const neededToAcceptAgents =
      await xmlUserPropertyCombinedService.approveAgents(
        propertyXML.tempProperties?.filter(
          (agent) => agent.approvalIssues?.length > 0
        ) || []
      )
    for (let i = 0; i < neededToAcceptAgents.length; i++) {
      const agent = neededToAcceptAgents![i]!
      try {
        await xmlUserPropertyCombinedService.publisher(
          agent,
          propertyXML.creator
        )
      } catch (error) {
        loggerService.error(
          `Skipping publishing agent: ${agent.email} due to error: ${error}`
        )
      }
    }
    // updated by reference form the above loops
    propertyXML.status = PropertyXMLStatus.Approved
    await propertyXML.save()
    await emailService.sendPropertiesXmlApprovedEmail(
      propertyXML.creator.email,
      propertyXML.creator.name,
      propertyXML.url
    )
    return sendSuccessResponse(
      res,
      {
        email: propertyXML.creator.email,
        name: propertyXML.creator.name,
        url: propertyXML.url
      },
      200
    )
  }

  async getOneXmlProperty(
    req: Request<GetXmlPropertyParams>,
    res: Response<GetXmlPropertyResponse>
  ) {
    const { id } = req.params
    const propertyXML =
      (await propertiesXMLService.readOne<PopulatedPropertiesXMLDocument>(
        { _id: id },
        {
          populateFields: ['creator'],
          throwErrorIf: ActionToTakeTypes.NotFound
        }
      ))!
    const respUser = (await getXmlUserData(propertyXML.creator))!

    const {
      agents: parsedAgentsWithDB,
      warnings: parsedWarningsWithDB,
      generalErrors: parsedGeneralErrorsWithDB
    } = await xmlUserPropertyCombinedService.dbMapper(
      propertyXML.originalParsedProperties!,
      propertyXML.warnings!,
      propertyXML.xmlErrors!
    )

    const validatedAgents = await xmlUserPropertyCombinedService.validateAgents(
      parsedAgentsWithDB,
      respUser,
      respUser.role as typeof UserRole.Broker | typeof UserRole.Company,
      PropertyValidatorModes.Admin
    )

    return sendSuccessResponse(res, {
      creator: serializeDto<User>(propertyXML.creator),
      _id: propertyXML._id.toString(),
      url: propertyXML.url,
      agents: validatedAgents,
      warnings: parsedWarningsWithDB,
      generalErrors: parsedGeneralErrorsWithDB,
      ...(propertyXML.rejectionReason && {
        rejectionReason: propertyXML.rejectionReason
      })
    })
  }

  async getAllXmlProperties(
    req: Request<
      any,
      GetAllXmlPropertiesResponse,
      any,
      GetAllXmlPropertiesQuery
    >,
    res: Response<GetAllXmlPropertiesResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)
    const populatedFields = populationBuilder(req.query.showFields)

    const { results, totalPages, totalResults } =
      await propertiesXMLService.findAll<PopulatedPropertiesXMLDocument>(
        {
          ...filter
        },
        {
          sort: sort ?? { createdAt: -1 },
          limit,
          page,
          populateFields: populatedFields
        }
      )
    return sendSuccessResponse(
      res,
      {
        items: results.map((item) => serializeDto<PropertiesXML>(item)),
        total: totalResults,
        limit,
        page,
        totalPages
      },
      200
    )
  }
}

export const propertiesXMLController = new PropertiesXMLController()
