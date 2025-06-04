import {
  PropertyStatusEnum,
  PropertyStatusEnumType,
  PropertyValidatorModes,
  PropertyValidatorModesType,
  PropertyXMLStatus,
  UserRole,
  UserStatus,
  XMLAgent,
  XMLProperty
} from '@commonTypes'
import { MESSAGES } from '@constants'
import {
  AppError,
  IUserDocument,
  PopulatedPropertiesXMLDocument,
  PopulatedPropertyDocument
} from '@contracts'
import {
  emailService,
  loggerService,
  propertiesXmlParserService,
  propertiesXMLService,
  propertyService,
  userService,
  xmlManagerService
} from '@services'
import moment from 'moment'

import { getActorData } from '@utils'

const generateGeneralErrorMessage = (agent: XMLAgent) => {
  const referenceNumbers = agent
    .properties!.map((prop) => prop.xmlMetaData?.referenceNumber)
    .join(', ')
  const message = `Properties with reference numbers ${referenceNumbers}, cannot be added as they are assigned to client user email in our database.`
  loggerService.error(`XML DB Mapper Error: ${message}: ${agent.email}`)
  return message
}
function generateRandomPassword(length: number) {
  const allChars =
    'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length)
    password += allChars[randomIndex]
  }
  return password
}
class XMLUserPropertyCombinedService {
  async checkReferenceNumberExistsInDb(
    properties: XMLProperty[],
    warnings: Record<string, string[]>
  ) {
    const indexesToDelete: Array<number> = []
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      if (!property) continue // Skip if property is undefined
      const refNumber = property.xmlMetaData.referenceNumber
      const existingProperty = await propertyService.readOne({
        'xmlMetaData.referenceNumber': refNumber
      })
      if (existingProperty) {
        if (
          moment(existingProperty.xmlMetaData.lastUpdated).isSameOrAfter(
            moment(property!.xmlMetaData.lastUpdated)
          )
        ) {
          warnings[refNumber] = [
            `Ignoring property with reference number ${refNumber}, as it is already updated in the database.`,
            ...(warnings[refNumber] || [])
          ]
          // delete properties[i];
          indexesToDelete.push(i)
          continue
        }
        warnings[refNumber] = [
          `Property with reference number ${refNumber} exists in the database, updating it.`,
          ...(warnings[refNumber] || [])
        ]
        property._id = existingProperty._id.toString()
      }
      continue
    }

    properties = properties.filter(
      (_prop, index) => !indexesToDelete.includes(index)
    )
    return properties
  }

  async dbMapper(
    parsedAgents: XMLAgent[],
    parsedWarnings: Record<string, string[]>,
    parsedGeneralErrors: string[]
  ) {
    const generalErrors = [...parsedGeneralErrors]
    const warnings = { ...parsedWarnings }
    // Step 1: Iterate over parsedAgents, remove users of type 'User' and generate errors
    let agents = []

    for (const agent of parsedAgents) {
      const existAgent = await userService.readOne({ email: agent.email })
      if (existAgent && existAgent.role !== UserRole.User) {
        agents.push({
          _id: existAgent.id,
          ...agent
        })
      } else if (existAgent && existAgent.role === UserRole.User) {
        generalErrors.push(generateGeneralErrorMessage(agent))

        agent!.properties!.forEach((property) => {
          delete warnings[property.xmlMetaData.referenceNumber]
        })
      } else {
        agents.push(agent)
      }
    }

    for (const agent of agents) {
      if (agent?.properties?.length) {
        agent.properties = await this.checkReferenceNumberExistsInDb(
          agent.properties,
          warnings
        )
        agent.properties.filter(Boolean)
      }
    }

    agents = agents.filter((agent) => agent.properties!.length > 0)

    return {
      agents,
      warnings,
      generalErrors
    }
  }

  async updateProperty(properties: any[]) {
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      if (!property!.isEligible) {
        continue
      }
      if (property?._id) {
        delete property?.status
        delete property?.createdBy
        await propertyService.update({ _id: property._id }, property, {
          actor: getActorData()
        })
      }
      continue
    }
  }

  async publishProperty(
    agent: IUserDocument | XMLAgent,
    properties: (XMLProperty & { status?: PropertyStatusEnumType })[]
  ) {
    const user = await userService.readOne({ _id: agent._id })
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      if (!property) {
        continue
      }
      if (!property.isEligible) {
        continue
      }
      if (property!._id) {
        delete property!.status
        delete property!.createdBy
        await propertyService.update({ _id: property!._id }, property as any, {
          actor: getActorData()
        })
      } else {
        property!.createdBy = user!.id
        property!.status = PropertyStatusEnum.Active
        await propertyService.create(
          {
            ...property,
            company: user?.company
          } as any,
          {
            actor: getActorData()
          }
        )
      }
    }
  }

  async publisher(agent: XMLAgent, creator: IUserDocument) {
    let user: IUserDocument | undefined
    let isNewUser = false
    if (!agent._id) {
      const userExists = await userService.readOne({
        email: agent.email
      })
      if (userExists) {
        user = userExists
        user._id = (user as any)._id
        isNewUser = false
      } else {
        const password = generateRandomPassword(10)
        user = await userService.create(
          {
            email: agent.email ?? '-',
            name: agent.name ?? '-',
            company: (creator.company as any) ?? null,
            role: creator.company ? UserRole.Agent : UserRole.Broker,
            username: `${agent.name} ${Date.now() % 10e6}`,
            password,
            status: UserStatus.Active,
            whatsapp: agent.phone ?? '-',
            phone: agent.phone ?? '-',
            chatMeta: {
              online: false,
              typing: false
            }
          },
          {
            actor: getActorData()
          }
        )
        await emailService.sendRegisterEmailWithPassword(agent.email, password)
        isNewUser = true
      }
    } else {
      user = (await userService.readOne({ _id: agent._id }))!
    }
    if ((agent?.approvalIssues?.length || 0) > 0) {
      return
    }
    if (!user) {
      return
    }

    await this.publishProperty(user, agent.properties)
    await emailService.sendPropertiesXmlAgentImportsEmail(
      agent.email,
      agent.name,
      creator.name,
      creator.role,
      isNewUser
    )
  }

  // Validation strategies based on user type
  private validationStrategies: Record<
    string,
    (
      agents: XMLAgent[],
      loggedInUser: IUserDocument,
      mode?: PropertyValidatorModesType
    ) => Promise<XMLAgent[]>
  > = {
    [UserRole.Broker]: this.agentValidator.bind(this),
    [UserRole.Company]: this.companyValidator.bind(this),
    pass: this.approveAgents.bind(this)
  }

  async validateAgents(
    agents: XMLAgent[],
    loggedInUser: IUserDocument,
    validationFor: typeof UserRole.Broker | typeof UserRole.Company,
    showMessagesForUser: PropertyValidatorModesType
  ) {
    // Determine which validation strategy to use based on user role
    const validator = this.validationStrategies[validationFor]
    if (validator) {
      return await validator(agents, loggedInUser, showMessagesForUser)
    } else {
      loggerService.error(
        `No validation strategy found for user role: ${validationFor} requested by user ${loggedInUser.email}`
      )
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }

  async companyValidator(
    agents: XMLAgent[],
    loggedInUser: IUserDocument,
    mode: PropertyValidatorModesType = PropertyValidatorModes.User
  ) {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]!
      agent['approvalIssues'] = []
      if (agent._id) {
        const user = (await userService.readOne({ _id: agent._id }))!
        if (
          // To check if the user belongs to a company
          !user.company ||
          // To check if the user belongs to xml creator's company
          user.company?.toString() !== loggedInUser.company?.toString()
        ) {
          let message =
            'This agent does not belong to the requesting company members'
          if (mode === PropertyValidatorModes.Admin) {
            const references = agent?.properties
              ?.map((prop) => prop.xmlMetaData?.referenceNumber)
              .join(', ')
            message = `The logged in user ${loggedInUser.email} of role ${loggedInUser.role} is requesting to add properties of references ${references} for another user with email ${user.email} that doesn't belong to his company`
          }
          agent['approvalIssues'].push(message)
        }
      }
      for (let j = 0; j < (agent.properties?.length ?? 0); j++) {
        const property = agent.properties![j]!
        property.isEligible = true
        if (!property._id) {
          continue
        }
        const prop = await propertyService.readOne<PopulatedPropertyDocument>(
          { _id: property._id },
          { populateFields: ['createdBy'] }
        )

        if (
          prop?.createdBy?.company?.toString() !==
          loggedInUser.company!.toString()
        ) {
          let message = `This property ${prop?.title} does not belong to the requesting company members`
          if (mode === PropertyValidatorModes.Admin) {
            message = `The logged in user ${loggedInUser.email} of role ${loggedInUser.role} is requesting to add properties of ${prop?.title} for another user with email ${prop?.createdBy?.email} that doesn't belong to his company`
          }
          agent['approvalIssues'].push(message)
          property.isEligible = false
          continue
        }
      }
    }
    return agents
  }

  async agentValidator(
    agents: XMLAgent[],
    loggedInUser: IUserDocument,
    mode: PropertyValidatorModesType = PropertyValidatorModes.User
  ) {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]!
      agent['approvalIssues'] = []
      let user
      if (agent._id) {
        user = (await userService.readOne({ _id: agent._id }))!
        if (user._id?.toString() !== loggedInUser._id?.toString()) {
          let message =
            'This agent does not belong to the requesting agent email'
          if (mode === PropertyValidatorModes.Admin) {
            const references = agent?.properties
              ?.map((prop) => prop.xmlMetaData?.referenceNumber)
              .join(', ')
            message = `The logged in user ${loggedInUser.email} of role  ${loggedInUser.role} is requesting to add properties of references ${references} for another user with email ${user.email}`
          }
          agent['approvalIssues'].push(message)
        }
      }
      for (let j = 0; j < (agent.properties?.length ?? 0); j++) {
        const property = agent.properties![j]!
        property.isEligible = true
        if (!property._id) {
          continue
        }
        const prop = await propertyService.readOne<PopulatedPropertyDocument>(
          { _id: property._id },
          { populateFields: ['createdBy'] }
        )
        if (prop?.createdBy?._id?.toString() !== loggedInUser._id?.toString()) {
          // if only a single property is not eligible then the agent is not eligible
          const message =
            mode === PropertyValidatorModes.User
              ? `This property ${prop?.title} does not belong to the requesting agent email ${loggedInUser.email}`
              : `The user with email ${loggedInUser.email} of role ${loggedInUser.role} is requesting to edit another users's property with title: ${prop?.title}`
          agent['approvalIssues'].push(message)
          property.isEligible = false
          continue
        }
      }
    }
    return agents
  }

  async approveAgents(agents: XMLAgent[]) {
    return agents.map((agent) => ({
      ...agent,
      properties: agent.properties?.map((property) => ({
        ...property,
        isEligible: true
      })),
      approvalIssues: []
    }))
  }

  async xmlScheduler() {
    const xmlEntities = (
      await propertiesXMLService.findAll<PopulatedPropertiesXMLDocument>(
        {
          status: PropertyXMLStatus.Approved
        },
        {
          populateFields: ['creator'],
          limit: Number.MAX_SAFE_INTEGER
        }
      )
    ).results
    for (let i = 0; i < xmlEntities.length; i++) {
      const xmlEntity = xmlEntities[i]
      if (!xmlEntity) continue
      const currentPlugin = propertiesXmlParserService.getAdapter(xmlEntity.url)
      if (!currentPlugin) continue
      const xmlString = await xmlManagerService.fetch(xmlEntity.url)
      const parsedJSONFromXML = await xmlManagerService.parse(xmlString)
      if (
        !moment(parsedJSONFromXML.last_update as string).isAfter(
          xmlEntity?.lastUpdatedAt
        )
      ) {
        loggerService.info(
          `XML FEED UPDATER: No new updates for ${xmlEntity.url}, skipping.`
        )
        continue
      }
      const {
        agents: parsedAgents,
        warnings: parsedWarnings,
        generalErrors: parsedGeneralErrors
      } = propertiesXmlParserService.parse(parsedJSONFromXML, currentPlugin)

      const {
        agents: parsedAgentsWithDB,
        warnings: parsedWarningsWithDB,
        generalErrors: parsedGeneralErrorsWithDB
      } = await this.dbMapper(parsedAgents, parsedWarnings, parsedGeneralErrors)

      const forcedPassAgents = await this.approveAgents(parsedAgentsWithDB)
      const properties = forcedPassAgents
        .map((agent) => agent.properties)
        .flat()
        .filter((property) => !!property._id)
      // Save the newTempProperties to the XML entity
      await propertiesXMLService.update(
        { _id: xmlEntity._id },
        {
          originalParsedProperties: parsedAgents,
          tempProperties: properties,
          warnings: parsedWarningsWithDB,
          errors: parsedGeneralErrorsWithDB,
          lastUpdatedAt: moment(
            parsedJSONFromXML?.last_update as string
          ).toDate()
        },
        {
          actor: getActorData()
        }
      )

      const newProperties = forcedPassAgents
        .map((agent) => agent.properties)
        .flat()
        .filter((property) => !property._id)
        .map((property) => property.xmlMetaData.referenceNumber)
        .join(', ')

      if (newProperties) {
        loggerService.info(
          `XML FEED UPDATER: New properties found for ${xmlEntity.url}, updating ${newProperties}.`
        )
        await emailService.newPropertiesFromXMLFeed(
          xmlEntity.creator?.email,
          xmlEntity.creator?.name,
          xmlEntity.url,
          newProperties
        )
      }
      if (properties.length > 0) {
        await this.updateProperty(properties)
        loggerService.info(
          `XML FEED UPDATER: Properties updated for ${xmlEntity.url}, updating ${properties.length} properties.`
        )

        await emailService.updatedPropertiesFromXMLFeed(
          xmlEntity.creator?.email,
          xmlEntity.creator?.name,
          xmlEntity.url
        )
      }
    }
  }
}

export const xmlUserPropertyCombinedService =
  new XMLUserPropertyCombinedService()
