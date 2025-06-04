import {
  RecommendationTypeEnum,
  RecommendationTypeEnumType
} from '@commonTypes'

export const RECOMMENDATION_SORTING_MAPPER: Record<
  RecommendationTypeEnumType,
  number
> = {
  [RecommendationTypeEnum.None]: 4,
  [RecommendationTypeEnum.HotDeal]: 3,
  [RecommendationTypeEnum.Signature]: 2,
  [RecommendationTypeEnum.PropertyOfTheWeek]: 1
}
