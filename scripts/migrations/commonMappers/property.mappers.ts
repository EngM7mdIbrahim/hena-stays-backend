import {
  CompletionEnum,
  FurnishedEnum,
  OwnerShipEnum,
  PropertyStatusEnum,
  SaleTypeEnum
} from '@commonTypes'

export const CompletionToOurs = {
  'Ready': CompletionEnum.Ready,
  'OffPlan': CompletionEnum.OffPlan,
  'Off-Plan': CompletionEnum.OffPlan,
  'Any': CompletionEnum.Ready
}

export const statusToOurs = {
  Sold: PropertyStatusEnum.Inactive,
  Draft: PropertyStatusEnum.Inactive,
  Rented: PropertyStatusEnum.Inactive,
  Pending: PropertyStatusEnum.Inactive,
  Sale: PropertyStatusEnum.Active
}

export const furnishedToOurs = {
  'Furnished': FurnishedEnum.Furnished,
  'Not Furnished': FurnishedEnum.Unfurnished,
  'Partially Furnished': FurnishedEnum.PartiallyFurnished,
  'Any': undefined
}

export const ownershipToOurs = {
  Individual: OwnerShipEnum.Individual,
  Corporate: OwnerShipEnum.Company,
  Freehold: OwnerShipEnum.Individual
}

export const typeToOurs = {
  Sale: SaleTypeEnum.Sale,
  Rent: SaleTypeEnum.Rent,
  Any: SaleTypeEnum.Sale
}
