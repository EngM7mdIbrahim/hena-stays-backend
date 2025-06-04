import { PropertiesXML, XMLAgent, XMLProperty } from '@commonTypes'
import { Model, Types } from 'mongoose'

import { BaseEntity } from './db.interface'
import { IUserDocument } from './user.interface'

// Database Interfaces
export interface IPropertiesXMLDocument
  extends BaseEntity,
    Omit<PropertiesXML, '_id' | 'creator'> {
  creator: Types.ObjectId
}

export interface PopulatedPropertiesXMLDocument
  extends Omit<IPropertiesXMLDocument, 'creator'> {
  creator: IUserDocument
}

export type IPropertiesXMLModel = Model<IPropertiesXMLDocument>

export type CreatePropertiesXMLDto = Omit<PropertiesXML, '_id' | 'createdAt'>

// Adapters
export interface ExtractedData {
  agent: XMLAgent
  property: XMLProperty
  warnings: string[]
}
export type PropertiesXMLMap = Record<string, any>
export type ExtractorFn = (xmlObject: Record<string, any>) => {
  data: any
  errors: string[]
}
export type PropertiesXMLAdapterExtractors = {
  propertyExtractors: Record<
    keyof Omit<XMLProperty, '_id' | 'createdBy' | 'isEligible'>,
    ExtractorFn
  >
  agentExtractors: Record<
    keyof Omit<XMLAgent, 'properties' | 'approvalIssues' | '_id'>,
    ExtractorFn
  >
  extract: (xmlObject: Record<string, any>) => ExtractedData
}
export interface PropertiesXMLAdapter {
  mappers: PropertiesXMLMap
  extractors: PropertiesXMLAdapterExtractors
  keys: PropertiesXMLMap
  values: PropertiesXMLMap
}
