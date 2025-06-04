import { propertiesXMLPlatformsAdapters } from '@adapters'
import { XMLAgent, XMLProperty } from '@commonTypes'
import { DEFAULT_AGENT_DTO } from '@constants'
import { PropertiesXMLAdapter } from '@contracts'

import { checkArray } from '@utils'

export class PropertiesXMLParserService {
  mergeAgentsData(originalAgentData: XMLAgent, newAgentData: XMLAgent) {
    return {
      email:
        originalAgentData?.email !== DEFAULT_AGENT_DTO?.email
          ? originalAgentData?.email
          : newAgentData?.email,
      name:
        originalAgentData?.name !== DEFAULT_AGENT_DTO?.name
          ? originalAgentData?.name
          : newAgentData?.name,
      phone:
        originalAgentData?.phone !== DEFAULT_AGENT_DTO?.phone
          ? originalAgentData?.phone
          : newAgentData?.phone,
      image:
        originalAgentData?.image !== DEFAULT_AGENT_DTO?.image
          ? originalAgentData?.image
          : newAgentData?.image
    }
  }
  processAddingAgentWithProperty(
    agents: XMLAgent[],
    agent: XMLAgent,
    property: XMLProperty
  ) {
    const existingAgentIndex = agents.findIndex(
      (currentAgent) => currentAgent.email === agent.email
    )
    if (existingAgentIndex !== -1) {
      const existingAgent = agents[existingAgentIndex]
      if (!existingAgent) {
        return
      }
      // Ensure properties array exists
      if (!existingAgent.properties) {
        existingAgent.properties = []
      }
      // Create a deep copy of the property and add it to the array
      const propertyCopy = JSON.parse(JSON.stringify(property))

      // Remove duplicates from amenities.basic if it exists
      if (propertyCopy.amenities?.basic) {
        propertyCopy.amenities.basic = Array.from(
          new Set(propertyCopy.amenities.basic)
        )
      }

      existingAgent.properties = [...existingAgent.properties, propertyCopy]
    } else {
      // Create new agent with initial properties array containing a deep copy
      const propertyCopy = JSON.parse(JSON.stringify(property))

      // Remove duplicates from amenities.basic if it exists
      if (propertyCopy.amenities?.basic) {
        propertyCopy.amenities.basic = Array.from(
          new Set(propertyCopy.amenities.basic)
        )
      }

      agents.push({ ...agent, properties: [propertyCopy] })
    }
  }

  parse(xml: any, platformAdapter: PropertiesXMLAdapter) {
    const generalErrors: string[] = []
    const warnings: Record<string, string[]> = {}
    const agents: XMLAgent[] = []
    if (!xml?.property || !checkArray(xml?.property)) {
      generalErrors.push('No properties found in the XML')
      return { generalErrors, warnings, agents }
    }

    for (let index = 0; index < xml.property.length; index++) {
      const propertyWithAgentXML = xml.property[index]
      try {
        const {
          agent,
          property,
          warnings: propertyWarnings
        } = platformAdapter.extractors.extract(propertyWithAgentXML)

        if (!property || !agent) {
          generalErrors.push(`Property ${index + 1} is missing required data`)
          continue
        }

        // Adding agent with property
        this.processAddingAgentWithProperty(agents, agent, property)

        // Adding warnings
        if (property.xmlMetaData?.referenceNumber) {
          warnings[property.xmlMetaData.referenceNumber] = propertyWarnings
        }
      } catch (error: unknown) {
        generalErrors.push(
          `Property ${index + 1} could not be parsed: ${(error as Error).message}`
        )
      }
    }
    return { generalErrors, warnings, agents }
  }
  getAdapter(url: string) {
    const arr = Object.keys(propertiesXMLPlatformsAdapters)
    let index = -1
    for (let i = 0; i < arr.length; i++) {
      if (url.toLowerCase().includes(arr[i]!.toLowerCase())) {
        index = i
        break
      }
    }
    if (index === -1) {
      return null
    }
    return propertiesXMLPlatformsAdapters[
      arr[index] as keyof typeof propertiesXMLPlatformsAdapters
    ]
  }
}

export const propertiesXmlParserService = new PropertiesXMLParserService()
