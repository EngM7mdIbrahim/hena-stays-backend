import {
  CompletionEnum,
  MediaTypes,
  RentDurationEnum,
  SaleTypeEnum,
  XMLAgent,
  XMLProperty
} from '@commonTypes'
import {
  DEFAULT_AGENT_DTO,
  DEFAULT_PROPERTY_DTO,
  DEFAULT_SUBCATEGORIES
} from '@constants'
import { ExtractedData, PropertiesXMLAdapter } from '@contracts'
import { loggerService } from '@services'
import moment from 'moment'

import {
  checkArray,
  checkDate,
  checkNumber,
  checkString,
  checkValueInEnum
} from '@utils'

import { XmlKeys } from './keys'
import { Mappers } from './mappers'
import { XmlValues } from './values'

const extractLastUpdate = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.LastUpdate]
  if (!checkDate(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.xmlMetaData.lastUpdated,
      errors: ['Invalid date format']
    }
  }
  return { data: moment(value).toDate(), errors: [] }
}

const extractReferenceNumber = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.ReferenceNumber]
  // Required Field
  if (!checkString(value)) {
    throw new Error('Missing reference number')
  }
  return { data: value, errors: [] }
}

const extractXmlMeta = (xmlObject: Record<string, any>) => {
  const { data: lastUpdate, errors: lastUpdateErrors } =
    extractLastUpdate(xmlObject)
  const { data: referenceNumber, errors: referenceNumberErrors } =
    extractReferenceNumber(xmlObject)
  return {
    data: { lastUpdate, referenceNumber },
    errors: [...lastUpdateErrors, ...referenceNumberErrors]
  }
}

const extractType = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.OfferType]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.type,
      errors: [
        `Missing offer type, using default value: ${DEFAULT_PROPERTY_DTO.type}`
      ]
    }
  }
  if (!Object.values(XmlValues.OfferType).includes(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.type,
      errors: [
        `Unsupported offer type: ${value}, using default value: ${DEFAULT_PROPERTY_DTO.type}`
      ]
    }
  }
  return { data: Mappers.OfferTypeMapper[value], errors: [] }
}

const extractTitle = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Name]
  if (!checkString(value)) {
    throw new Error('Missing name')
  }
  return { data: value, errors: [] }
}

const extractDescription = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Description]
  if (!checkString(value)) {
    throw new Error('Missing description')
  }
  return { data: value, errors: [] }
}

const extractCompletion = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Completion]
  if (!checkString(value)) {
    const { data: type, errors: typeErrors } = extractType(xmlObject)
    if (typeErrors.length > 0) {
      return {
        data: DEFAULT_PROPERTY_DTO.completion,
        errors: [
          `Missing completion, using default value: ${DEFAULT_PROPERTY_DTO.completion}`
        ]
      }
    }
    if (type === SaleTypeEnum.Sale) {
      return {
        data: DEFAULT_PROPERTY_DTO.completion,
        errors: [
          `Missing completion, based on offer type: ${type}, setting to: ${CompletionEnum.OffPlan}`
        ]
      }
    } else {
      // For rent, completion is always ready
      return {
        data: CompletionEnum.Ready,
        errors: []
      }
    }
  }
  if (!Object.values(XmlValues.CompletionStatus).includes(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.completion,
      errors: [
        `Unsupported completion status: ${value}, using default value: ${DEFAULT_PROPERTY_DTO.completion}`
      ]
    }
  }
  return { data: Mappers.CompletionMapper[value], errors: [] }
}

const extractFurnished = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Furnished]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.furnished,
      errors: [
        `Missing furnished, using default value: ${DEFAULT_PROPERTY_DTO.furnished}`
      ]
    }
  }
  if (!Object.values(XmlValues.FurnishedStatus).includes(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.furnished,
      errors: [
        `Unsupported furnished status: ${value}, using default value: ${DEFAULT_PROPERTY_DTO.furnished}`
      ]
    }
  }
  return { data: Mappers.FurnishedMapper[value], errors: [] }
}

const extractLongLat = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.LongLat]
  const errors: Array<any> = []
  if (!checkString(value)) {
    errors.push(
      `Missing long lat, using default value: ${DEFAULT_PROPERTY_DTO.location?.coordinates[1]}, ${DEFAULT_PROPERTY_DTO.location?.coordinates[0]}`
    )
    return {
      data: {
        lng: DEFAULT_PROPERTY_DTO.location?.coordinates[1],
        lat: DEFAULT_PROPERTY_DTO.location?.coordinates[0]
      },
      errors
    }
  }
  const [longitude, latitude] = value.split(',')
  if (!checkNumber(longitude)) {
    errors.push(
      `Invalid longitude, using default value: ${DEFAULT_PROPERTY_DTO.location?.coordinates[1]}, ${DEFAULT_PROPERTY_DTO.location?.coordinates[0]}`
    )
    return {
      data: {
        lng: DEFAULT_PROPERTY_DTO.location?.coordinates[1],
        lat: DEFAULT_PROPERTY_DTO.location?.coordinates[0]
      },
      errors
    }
  }
  if (!checkNumber(latitude)) {
    errors.push(
      `Invalid latitude, using default value: ${DEFAULT_PROPERTY_DTO.location?.coordinates[1]}, ${DEFAULT_PROPERTY_DTO.location?.coordinates[0]}`
    )
    return {
      data: {
        lng: DEFAULT_PROPERTY_DTO.location?.coordinates[1],
        lat: DEFAULT_PROPERTY_DTO.location?.coordinates[0]
      },
      errors
    }
  }
  return { data: { lng: longitude, lat: latitude }, errors }
}

const extractCity = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.City]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.location?.city,
      errors: [
        `Missing city, using default value: ${DEFAULT_PROPERTY_DTO.location?.city}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractNeighborhood = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Neighborhood]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.location?.neighborhoods,
      errors: [
        `Missing neighborhood, using default value: ${DEFAULT_PROPERTY_DTO.location?.neighborhoods}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractState = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.State]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.location?.state,
      errors: [
        `Missing state, using default value: ${DEFAULT_PROPERTY_DTO.location?.state}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractStreet = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Street]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.location?.street,
      errors: [
        `Missing street, using default value: ${DEFAULT_PROPERTY_DTO.location?.street}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractCountry = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Country]
  if (!checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.location?.country,
      errors: [
        `Missing country, using default value: ${DEFAULT_PROPERTY_DTO.location?.country}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractLocation = (xmlObject: Record<string, any>) => {
  const { data: lngLat, errors: lngLatErrors } = extractLongLat(xmlObject)
  const { data: city, errors: cityErrors } = extractCity(xmlObject)
  const { data: neighborhoods, errors: neighborhoodErrors } =
    extractNeighborhood(xmlObject)
  const { data: state, errors: stateErrors } = extractState(xmlObject)
  const { data: street, errors: streetErrors } = extractStreet(xmlObject)
  const { data: country, errors: countryErrors } = extractCountry(xmlObject)
  const address = `${street}, ${city}, ${state}, ${country}`
  return {
    data: {
      city,
      neighborhoods,
      state,
      street,
      coordinates: [lngLat.lat, lngLat.lng],
      country,
      address,
      name: '-'
    },
    errors: [
      ...lngLatErrors,
      ...cityErrors,
      ...neighborhoodErrors,
      ...stateErrors,
      ...streetErrors,
      ...countryErrors
    ]
  }
}

const extractMediaType = (url: string) => {
  const extension = url.split('.').pop()!.toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const videoExtensions = ['mp4', 'mov', 'avi', 'webm']

  if (imageExtensions.includes(extension)) {
    return MediaTypes.Image
  }
  if (videoExtensions.includes(extension)) {
    return MediaTypes.Video
  }
  return MediaTypes.Image // default fallback
}

const extractMedia = (xmlObject: Record<string, any>) => {
  const value =
    xmlObject?.[XmlKeys.Property.Media.Key]?.[XmlKeys.Property.Media.Url]
  if (!checkString(value) && !checkArray(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.media,
      errors: [
        `Missing media, using default value: ${DEFAULT_PROPERTY_DTO.media}`
      ]
    }
  }
  const filteredMedia = value.filter(({ _ }: { _?: string }) => checkString(_))
  if (filteredMedia.length === 0) {
    return {
      data: DEFAULT_PROPERTY_DTO.media,
      errors: [
        `Missing media, using default value: ${DEFAULT_PROPERTY_DTO.media}`
      ]
    }
  }
  const media = filteredMedia.map(({ _ }: { _: string }) => ({
    url: _,
    type: extractMediaType(_)
  }))
  return { data: media, errors: [] }
}

const extractPlotArea = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.PlotArea]
  if (!checkNumber(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.area?.plot,
      errors: [
        `Missing plot area, using default value: ${DEFAULT_PROPERTY_DTO.area?.plot}`
      ]
    }
  }
  return { data: value, errors: [] }
}
const extractBuiltInArea = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.Area]
  if (!checkNumber(value)) {
    return {
      data: 0,
      errors: [
        `Missing built in area, using default value: ${DEFAULT_PROPERTY_DTO.area?.builtIn}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractArea = (xmlObject: Record<string, any>) => {
  const { data: plotArea, errors: plotAreaErrors } = extractPlotArea(xmlObject)
  const { data: builtInArea, errors: builtInAreaErrors } =
    extractBuiltInArea(xmlObject)
  return {
    data: { plotArea, builtInArea },
    errors: [...plotAreaErrors, ...builtInAreaErrors]
  }
}

const extractCategory = (xmlObject: Record<string, any>) => {
  const offerTypeValue = xmlObject?.[XmlKeys.Property.OfferType]
  if (!checkString(offerTypeValue)) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Missing offer type for determining the category, using default value: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const category = xmlObject?.[XmlKeys.Property.Category]
  if (!checkString(category)) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Missing property type for determining the category, using default value: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const currentCategoryMapper = Mappers.SubCategoryMapper[offerTypeValue]
  if (!currentCategoryMapper) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Unsupported offer type: ${offerTypeValue}, using default value for category: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const currentCategory = currentCategoryMapper[category]
  if (!currentCategory) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Unsupported property type: ${category}, using default value for category: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const subCategoryId =
    DEFAULT_SUBCATEGORIES.find(({ code }) => code === currentCategory) ??
    DEFAULT_SUBCATEGORIES.find(
      ({ code }) => code === DEFAULT_PROPERTY_DTO.subCategory
    )
  return { data: subCategoryId!.category, errors: [] }
}

const extractSubCategory = (xmlObject: Record<string, any>) => {
  const offerTypeValue = xmlObject?.[XmlKeys.Property.OfferType]
  if (!checkString(offerTypeValue)) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Missing offer type for determining the category, using default value: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const category = xmlObject?.[XmlKeys.Property.Category]
  if (!checkString(category)) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Missing property type for determining the category, using default value: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const currentCategoryMapper = Mappers.SubCategoryMapper[offerTypeValue]
  if (!currentCategoryMapper) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Unsupported offer type: ${offerTypeValue}, using default value for category: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const currentCategory = currentCategoryMapper[category]
  if (!currentCategory) {
    return {
      data: DEFAULT_PROPERTY_DTO.category,
      errors: [
        `Unsupported property type: ${category}, using default value for category: ${DEFAULT_PROPERTY_DTO.category}`
      ]
    }
  }
  const subCategoryId =
    DEFAULT_SUBCATEGORIES.find(({ code }) => code === currentCategory) ??
    DEFAULT_SUBCATEGORIES.find(
      ({ code }) => code === DEFAULT_PROPERTY_DTO.subCategory
    )
  return {
    data: subCategoryId!._id,
    errors: []
  }
}

const extractPermit = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Property.PermitNumber]
  if (!checkNumber(value) && !checkString(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.permit,
      errors: [
        `Missing permit number, using default value: ${DEFAULT_PROPERTY_DTO.permit.number}`
      ]
    }
  }
  return {
    data: {
      number: value,
      BRN: value
    },
    errors: []
  }
}

const extractAmenities = (xmlObject: Record<string, any>) => {
  const currentAmenitiesCodesValue =
    xmlObject?.[XmlKeys.Property.Amenities.PrivateAmenities] +
    ',' +
    xmlObject?.[XmlKeys.Property.Amenities.CommercialAmenities]

  const currentFeaturesValue = xmlObject?.[XmlKeys.Property.Amenities.Features]
  const errors: Array<any> = []

  if (
    !checkString(currentAmenitiesCodesValue) &&
    !checkString(currentFeaturesValue)
  ) {
    return {
      data: DEFAULT_PROPERTY_DTO.amenities,
      errors: [
        `Missing amenities, using default value: ${DEFAULT_PROPERTY_DTO.amenities}`
      ]
    }
  }
  const currentAmenities = [
    ...(currentAmenitiesCodesValue ?? '')
      .split(',')
      .map((amenity) => amenity.trim())
  ]
  const currentFeatures = [
    ...(currentFeaturesValue ?? '')
      .split(',')
      .map((feature: string) => feature.trim())
  ]

  // 1st stage: map amenities to features
  const amenitiesToFeatures = currentAmenities
    .map((amenity) => {
      if (Mappers.AmenityCodeToFeatureMapper[amenity]) {
        return Mappers.AmenityCodeToFeatureMapper[amenity]
      }
      errors.push(`Unsupported amenity: ${amenity}`)
      return null
    })
    .filter(Boolean)

  // 2nd stage: map features to amenities
  const allCurrentFeatures = Array.from(
    new Set([...amenitiesToFeatures, ...currentFeatures])
  )

  const basic: string[] = []
  const other: string[] = []
  allCurrentFeatures.forEach((feature) => {
    if (Mappers.BasicAmenitiesMapper[feature]) {
      basic.push(Mappers.BasicAmenitiesMapper[feature])
    } else {
      other.push(feature)
    }
  })
  return { data: { basic, other }, errors }
}

const extractBedrooms = (xmlObject: Record<string, any>) => {
  let value = xmlObject?.[XmlKeys.Property.Bedrooms]

  if (typeof value === 'string' && value.endsWith('+')) {
    value = parseInt(value, 10) + 1
  }
  if (typeof value === 'string' && value === 'Studio') {
    value = 0
  }

  if (!checkNumber(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.bedroom,
      errors: [
        `Missing bedrooms, using default value: ${DEFAULT_PROPERTY_DTO.bedroom}`
      ]
    }
  }

  return { data: value, errors: [] }
}

const extractBathrooms = (xmlObject: Record<string, any>) => {
  let value = xmlObject?.[XmlKeys.Property.Bathrooms]

  // Check if the value ends with '+', e.g., '7+'
  if (typeof value === 'string' && value.endsWith('+')) {
    value = parseInt(value, 10) + 1
  }

  if (!checkNumber(value)) {
    return {
      data: DEFAULT_PROPERTY_DTO.toilets,
      errors: [
        `Missing toilets or bathrooms, using default value: ${DEFAULT_PROPERTY_DTO.toilets}`
      ]
    }
  }

  return { data: value, errors: [] }
}

const extractPrice = (xmlObject: Record<string, any>) => {
  const priceValue = xmlObject?.[XmlKeys.Property.Price]
  const { data: offerType, errors: offerTypeErrors } = extractType(xmlObject)
  if (offerTypeErrors.length > 0) {
    return {
      data: DEFAULT_PROPERTY_DTO.price,
      errors: [
        `Missing offer type for determining the price, using default value: ${DEFAULT_PROPERTY_DTO.price}`
      ]
    }
  }
  if (offerType === SaleTypeEnum.Sale) {
    if (!checkNumber(priceValue)) {
      return {
        data: DEFAULT_PROPERTY_DTO.price,
        errors: [
          `Missing price for sale, using default value: ${DEFAULT_PROPERTY_DTO.price}`
        ]
      }
    }
    return {
      data: {
        ...DEFAULT_PROPERTY_DTO.price,
        value: Number(priceValue)
      },
      errors: []
    }
  } else {
    // For rent price, priority is given to highest duration
    const rentalPeriod = xmlObject?.[XmlKeys.Property.RentalPeriod]
    const priceObj = xmlObject?.[XmlKeys.Property.Price]
    const priceValue = priceObj?.[XmlKeys.Property.Yearly]
    if (!checkNumber(priceValue)) {
      return {
        data: DEFAULT_PROPERTY_DTO.price,
        errors: [
          `Missing price for rent, using default value: ${DEFAULT_PROPERTY_DTO.price.value}`
        ]
      }
    }
    const result = {
      ...DEFAULT_PROPERTY_DTO.price,
      value: Number(priceValue)
    }
    if (!checkString(rentalPeriod)) {
      return {
        data: {
          ...result,
          duration: RentDurationEnum.Yearly
        },
        errors: [
          `Missing rental period for rent price: ${result.value}, setting duration to yearly`
        ]
      }
    }
    if (
      !checkValueInEnum(
        rentalPeriod,
        Object.values(XmlValues.RentalPeriodTypes)
      )
    ) {
      return {
        data: {
          ...result,
          duration: RentDurationEnum.Yearly
        },
        errors: [
          `Unsupported rental period: ${rentalPeriod}, setting duration to yearly`
        ]
      }
    }
    return {
      data: {
        ...result,
        duration: Mappers.RentalPeriodMapper[rentalPeriod]
      },
      errors: []
    }
  }
}

const PropertyExtractors: PropertiesXMLAdapter['extractors']['propertyExtractors'] =
  {
    xmlMetaData: extractXmlMeta,
    type: extractType,
    title: extractTitle,
    description: extractDescription,
    completion: extractCompletion,
    furnished: extractFurnished,
    location: extractLocation,
    media: extractMedia,
    area: extractArea,
    category: extractCategory,
    subCategory: extractSubCategory,
    permit: extractPermit,
    amenities: extractAmenities,
    bedroom: extractBedrooms,
    toilets: extractBathrooms,
    price: extractPrice
  }

const extractProperty = (
  xmlObject: Record<string, any>
): { property: ExtractedData['property']; errors: string[] } => {
  const errors: Array<any> = []
  const property: XMLProperty = DEFAULT_PROPERTY_DTO
  Object.keys(DEFAULT_PROPERTY_DTO).forEach((key) => {
    if (!PropertyExtractors[key as keyof typeof PropertyExtractors]) {
      loggerService.log(`Missing extractor for key: ${key}`)
      return
    }
    const secondKey: keyof XMLProperty = key as keyof XMLProperty
    const { data, errors: keyErrors } =
      PropertyExtractors[key as keyof typeof PropertyExtractors](xmlObject)
    // @ts-expect-error Expected to have type of never
    property[secondKey] = data
    errors.push(...keyErrors)
  })
  return { property, errors }
}

const extractAgentEmail = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Agent.Email]
  if (!checkString(value)) {
    throw new Error('Missing email for this agent')
  }
  return { data: value, errors: [] }
}

const extractAgentName = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Agent.Name]
  if (!checkString(value)) {
    return {
      data: DEFAULT_AGENT_DTO.name,
      errors: [
        `Missing name for this agent, using default value: ${DEFAULT_AGENT_DTO.name}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const extractAgentPhone = (xmlObject: Record<string, any>) => {
  const value: string = xmlObject?.[XmlKeys.Agent.Phone]
  if (!checkString(value)) {
    return {
      data: DEFAULT_AGENT_DTO.phone,
      errors: [
        `Missing phone for this agent, using default value: ${DEFAULT_AGENT_DTO.phone}`
      ]
    }
  }
  return {
    data: `${value?.replaceAll(' ', '').startsWith('+') ? value?.replaceAll(' ', '') : `+${value?.replaceAll(' ', '')}`}`,
    errors: []
  }
}
const extractAgentImage = (xmlObject: Record<string, any>) => {
  const value = xmlObject?.[XmlKeys.Agent.Photo]
  if (!checkString(value)) {
    return {
      data: DEFAULT_AGENT_DTO.image,
      errors: [
        `Missing image for this agent, using default value: ${DEFAULT_AGENT_DTO.image}`
      ]
    }
  }
  return { data: value, errors: [] }
}

const AgentExtractors: PropertiesXMLAdapter['extractors']['agentExtractors'] = {
  email: extractAgentEmail,
  name: extractAgentName,
  phone: extractAgentPhone,
  image: extractAgentImage
}

const extractAgent = (
  xmlObject: Record<string, any>
): { agent: ExtractedData['agent']; errors: string[] } => {
  const agentValue = xmlObject?.[XmlKeys.Property.Agent]
  if (!agentValue) {
    throw new Error('Missing agent for this property')
  }
  const errors: Array<any> = []
  const agent: XMLAgent = DEFAULT_AGENT_DTO
  Object.keys(DEFAULT_AGENT_DTO).forEach((key) => {
    if (!AgentExtractors[key as keyof typeof AgentExtractors]) return
    const { data, errors: keyErrors } =
      AgentExtractors[key as keyof typeof AgentExtractors](agentValue)
    agent[key as keyof XMLAgent] = data
    errors.push(...keyErrors)
  })
  return { agent, errors }
}

function extractDataFromXMLObject(
  xmlObject: Record<string, any>
): ExtractedData {
  const { property, errors: propertyWarnings } = extractProperty(xmlObject)
  const { agent, errors: agentWarnings } = extractAgent(xmlObject)
  return { property, agent, warnings: [...agentWarnings, ...propertyWarnings] }
}

const Extractors: PropertiesXMLAdapter['extractors'] = {
  propertyExtractors: PropertyExtractors,
  agentExtractors: AgentExtractors,
  extract: extractDataFromXMLObject
}

export default Extractors
