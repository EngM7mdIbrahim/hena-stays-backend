import { ActionToTakeType } from '@services'
import { ClientSession, PopulateOptions, SortOrder } from 'mongoose'

interface CommonFindExtraConfig {
  populateFields?: (PopulateOptions | string)[]
  sort?: Record<string, SortOrder>
  select?: string
  includeDeleted?: boolean
  session?: ClientSession | null
}
export interface FindAllExtraConfig extends CommonFindExtraConfig {
  limit?: number
  page?: number
}

export interface ReadOneExtraConfig extends CommonFindExtraConfig {
  throwErrorIf?: ActionToTakeType
}

interface CommonCreateUpdateAnDeleteExtraConfig {
  actor: string
  session?: ClientSession | null
  includeDeleted?: boolean
}
interface CommonCreateAndUpdateExtraConfig
  extends CommonCreateUpdateAnDeleteExtraConfig {
  session?: ClientSession | null
  includeDeleted?: boolean
  throwErrorIf?: ActionToTakeType
}

export type CreateExtraConfig = CommonCreateAndUpdateExtraConfig
export type UpdateExtraConfig = CommonCreateAndUpdateExtraConfig
export type DeleteExtraConfig = CommonCreateUpdateAnDeleteExtraConfig
