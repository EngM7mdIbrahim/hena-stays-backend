import { PropertyXMLStatus } from '@commonTypes'
import { z } from 'zod'

export const AddPropertyXMLValidation = z.object({
  url: z.string().url()
})

export const PublishPropertyXMLValidation = z.object({
  id: z.string()
})

export const UpdateAgentEmailValidation = z.object({
  id: z.string(),
  previousAgentEmail: z.string(),
  newAgentEmail: z.string()
})

export const AdminApprovementValidation = z.object({
  id: z.string(),
  status: z.enum([PropertyXMLStatus.Approved, PropertyXMLStatus.Rejected]),
  message: z.string().optional()
})

export const GetOneXmlPropertyValidation = z.object({
  id: z.string()
})
