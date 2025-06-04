import {
  projectPropertyCombinedService,
  subscriptionsPropertyCombinedService
} from '@combinedServices'
import {
  ActionToTakeTypes,
  BulkUpdateRecommendationsRequestBody,
  BulkUpdateRecommendationsResponse,
  CreatePropertyRequestBody,
  CreatePropertyResponse,
  DeletePropertyRequestBody,
  DeletePropertyRequestParams,
  DeletePropertyResponse,
  GetAllPropertiesQuery,
  GetAllPropertiesResponse,
  GetNearMeQuery,
  GetNearMeResponse,
  GetOnePropertyQuery,
  GetOnePropertyRequestParams,
  GetOnePropertyResponse,
  Interactions,
  LocationTypes,
  Property,
  PropertyStatusEnum,
  RequestTypes,
  UpdatePropertyRequestBody,
  UpdatePropertyRequestParams,
  UpdatePropertyResponse,
  UserRole
} from '@commonTypes'
import { DEFAULT_NEAR_ME_RADIUS, MESSAGES } from '@constants'
import { IUserDocument, PopulatedPropertyDocument } from '@contracts'
import {
  interactionsService,
  propertySaveService,
  propertyService
} from '@services'
import { NextFunction, Request, Response } from 'express'
import { RootFilterQuery } from 'mongoose'

import {
  getActorData,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

function filterProtection(
  filters: RootFilterQuery<Property>,
  action: string = RequestTypes.Get,
  user?: IUserDocument,
  isMineRequested: boolean = false
) {
  if (user?.role === UserRole.Admin) {
    return filters
  }

  if (action === RequestTypes.Get) {
    if (isMineRequested) {
      if (
        user?.role === UserRole.Company ||
        user?.role === UserRole.CompanyAdmin
      ) {
        return { ...filters, company: user?.company }
      }
      return { ...filters, createdBy: user?._id }
    } else {
      return { ...filters, status: PropertyStatusEnum.Active }
    }
    return filters
  }

  if (!user) {
    throw new Error(MESSAGES.AUTH.RESTRICTION_MESSAGE)
  }

  if (user?.role === UserRole.Company || user?.role === UserRole.CompanyAdmin) {
    return { ...filters, company: user?.company }
  }
  return { ...filters, createdBy: user?._id }
}

async function filterSavedByMe(
  filters: RootFilterQuery<Property>,
  user?: IUserDocument,
  savedByMe: boolean = false
) {
  if (!savedByMe || !user) {
    return filters
  }
  const allPropertySaves = await propertySaveService.findAll({ user: user._id })
  const propertyIds = allPropertySaves.results.map((save) => save.property)
  return { ...filters, _id: { $in: propertyIds } }
}

function canReturnInteractionData(
  user: IUserDocument,
  property: PopulatedPropertyDocument
) {
  if (user.role === UserRole.Admin || user.role === UserRole.AdminViewer) {
    return true
  }
  if (user.role === UserRole.Broker || user.role === UserRole.Agent) {
    return user._id.toString() === property.createdBy?._id
  }
  if (user.role === UserRole.Company || user.role === UserRole.CompanyAdmin) {
    return (
      user.company?.toString() ===
      (property.company?._id
        ? property.company?._id.toString()
        : property.company?.toString())
    )
  }
  return false
}
async function serializeAndAddPropertyMeta(
  properties: PopulatedPropertyDocument[],
  user?: IUserDocument
) {
  let serializedProperties = properties.map((property) =>
    serializeDto<GetAllPropertiesResponse['items'][number]>(property)
  )
  if (user) {
    // add interactions meta
    const eligiblePropertyIdsForInteractions = properties
      .filter((property) => canReturnInteractionData(user, property))
      .map((property) => property._id)
    const eligiblePropertiesInteractions = (
      await interactionsService.findAll({
        property: { $in: eligiblePropertyIdsForInteractions }
      })
    ).results
    const serializePropertiesInteractions = eligiblePropertiesInteractions.map(
      (interaction) => serializeDto<Interactions>(interaction)
    )
    // add saved by me meta
    const savedPropertiesByMe = await propertySaveService.findAll({
      user: user._id
    })
    const savedPropertyIdsByMe = savedPropertiesByMe.results.map((save) =>
      save.property.toString()
    )
    serializedProperties = serializedProperties.map((property) => {
      const interaction = serializePropertiesInteractions.find(
        (interaction) => interaction.property.toString() === property._id
      )
      return {
        ...property,
        ...(interaction && { interaction }),
        isSavedByMe: savedPropertyIdsByMe.includes(property._id)
      }
    })
  }
  return serializedProperties
}

async function addLocationFilters(
  filters: RootFilterQuery<Property>,
  startLocation: GetAllPropertiesQuery['startLocation'],
  endLocation: GetAllPropertiesQuery['endLocation']
) {
  if (!startLocation) {
    return filters
  } else if (!endLocation) {
    if (startLocation.lat && startLocation.lng) {
      const { maxLat, maxLng, minLat, minLng } = getBoundingBox(
        Number(startLocation.lat),
        Number(startLocation.lng),
        25
      )
      filters = {
        ...filters,
        location: {
          $geoWithin: {
            $box: [
              [minLng, minLat], // bottom left
              [maxLng, maxLat] // top right
            ]
          }
        }
      }
    }
    const entries = Object.entries(startLocation)
    for (const [key, value] of entries) {
      if (key === 'lat' || key === 'lng') {
        continue
      }
      filters = {
        ...filters,
        [`location.${key}`]: {
          $regex: value,
          $options: 'i'
        }
      }
    }
  } else {
    if (
      startLocation.lat &&
      startLocation.lng &&
      endLocation.lat &&
      endLocation.lng
    ) {
      // Create a bounding box using the start and end coordinates
      const minLat = Math.min(startLocation.lat, endLocation.lat)
      const maxLat = Math.max(startLocation.lat, endLocation.lat)
      const minLng = Math.min(startLocation.lng, endLocation.lng)
      const maxLng = Math.max(startLocation.lng, endLocation.lng)

      filters = {
        ...filters,
        location: {
          $geoWithin: {
            $box: [
              [minLng, minLat], // bottom left
              [maxLng, maxLat] // top right
            ]
          }
        }
      }
    }
  }
  return filters
}

/*
 * @class PropertyController
 * @description Property Controller
 * @exports PropertyController
 * @functions:
 * - createProperty
 * - readAllProperty (public, protected, private) => filter by
 * - getMySavedProperties (protected, private)
 * - get nearest properties, will take radius with max 50 and min 5 with default 10 and latlng from the request
 * - readOneProperty
 * - updateProperty (protected, private)
 * - deleteProperty (protected, private)
 */
class PropertyController {
  async createProperty(
    req: Request<any, any, CreatePropertyRequestBody>,
    res: Response<CreatePropertyResponse>
  ) {
    const property = await propertyService.create(
      {
        ...req.body,
        createdBy: String(req.user!._id),
        company: req.user?.company ? String(req.user?.company) : undefined
      },
      { actor: getActorData(req) }
    )
    if (property?.project) {
      await projectPropertyCombinedService.setNewProjectUnits(property)
    }
    return sendSuccessResponse(res, {
      property: serializeDto<Property>(property)
    })
  }
  async readAllProperty(
    req: Request<any, any, any, GetAllPropertiesQuery>,
    res: Response<GetAllPropertiesResponse>,
    next: NextFunction
  ) {
    const {
      page,
      limit,
      sort,
      filter: baseFilter
    } = getPaginationData(req.query)
    let filter = filterProtection(
      baseFilter,
      RequestTypes.Get,
      req.user,
      req.query?.mine === 'true'
    )
    filter = await filterSavedByMe(
      filter,
      req.user,
      req.query?.savedByMe === 'true'
    )

    filter = await addLocationFilters(
      filter,
      req.query.startLocation,
      req.query.endLocation
    )
    const populateFields = populationBuilder(req.query.showFields)
    const properties = await propertyService.findAll<PopulatedPropertyDocument>(
      { ...filter },
      {
        sort: {
          ...sort,
          'meta.recommendationSortingOrder': 1
        },
        limit,
        page,
        populateFields
      }
    )
    const serializedProperties = await serializeAndAddPropertyMeta(
      properties.results,
      req.user
    )
    sendSuccessResponse(res, {
      items: serializedProperties,
      total: properties.totalResults,
      limit: properties.limit,
      page: properties.page,
      totalPages: properties.totalPages,
      hasNext: properties.page < properties.totalPages,
      nextPage:
        properties.page < properties.totalPages
          ? properties.page + 1
          : undefined
    })
    res.locals.properties = serializedProperties
    next()
  }

  async readOneProperty(
    req: Request<GetOnePropertyRequestParams, any, any, GetOnePropertyQuery>,
    res: Response<GetOnePropertyResponse>
  ) {
    const populateFields = populationBuilder(req.query.showFields)
    const property = await propertyService.readOne<PopulatedPropertyDocument>(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    const [serializedProperty] = await serializeAndAddPropertyMeta(
      [property!],
      req.user
    )
    return sendSuccessResponse(res, {
      property: serializedProperty!
    })
  }

  async getPropertiesNearMe(
    req: Request<any, any, any, GetNearMeQuery>,
    res: Response<GetNearMeResponse>,
    next: NextFunction
  ) {
    const { latlng, rad = DEFAULT_NEAR_ME_RADIUS } = req.query
    const [lat, lng] = latlng.split(',')
    const radius = Number(rad) ?? 25
    const populateFields = populationBuilder(req.query.showFields)
    let filter = {
      location: {
        $near: {
          $geometry: {
            type: LocationTypes.Point,
            coordinates: [Number(lat), Number(lng)]
          },
          $maxDistance: radius
        }
      }
    }
    filter = await filterSavedByMe(
      filter,
      req.user,
      req.query?.savedByMe === 'true'
    )
    const properties = await propertyService.findAll<PopulatedPropertyDocument>(
      filter,
      {
        populateFields,
        sort: { 'createdAt': -1, 'meta.recommendationSortingOrder': 1 }
      }
    )
    const serializedProperties = await serializeAndAddPropertyMeta(
      properties.results,
      req.user
    )
    sendSuccessResponse(res, {
      items: serializedProperties,
      total: properties.totalResults,
      limit: properties.limit,
      page: properties.page,
      totalPages: properties.totalPages,
      hasNext: properties.page < properties.totalPages,
      nextPage:
        properties.page < properties.totalPages
          ? properties.page + 1
          : undefined
    })
    res.locals.properties = serializedProperties
    next()
  }

  async updateProperty(
    req: Request<UpdatePropertyRequestParams, any, UpdatePropertyRequestBody>,
    res: Response<UpdatePropertyResponse>
  ) {
    const filter = filterProtection({}, RequestTypes.Update, req.user)
    const uneditableFields = ['recommended', 'recommendationExpiresAt']
    const updateBody = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key]) => !uneditableFields.includes(key)
      )
    )
    const property = await propertyService.update(
      { _id: req.params.id, ...filter },
      updateBody,
      { actor: getActorData(req) }
    )
    if (property?.project) {
      await projectPropertyCombinedService.setUpdateProjectUnits(
        property.category.toString(),
        property.subCategory.toString(),
        property?.project.toString()
      )
    }
    return sendSuccessResponse(res, {
      property: serializeDto<Property>(property)
    })
  }

  async bulkUpdatePropertiesRecommendation(
    req: Request<any, any, BulkUpdateRecommendationsRequestBody>,
    res: Response<BulkUpdateRecommendationsResponse>
  ) {
    const { propertyIds, recommended, recommendationNoExpireDays } = req.body
    const { page, limit, sort } = getPaginationData(req.query)
    await subscriptionsPropertyCombinedService.bulkUpdatePropertyRecommendations(
      req.user!,
      propertyIds,
      recommended,
      recommendationNoExpireDays,
      req.dbSession!,
      getActorData(req)
    )
    const populateFields = populationBuilder(req.query.showFields)
    const properties = await propertyService.findAll<PopulatedPropertyDocument>(
      { _id: { $in: propertyIds } },
      {
        populateFields,
        sort,
        limit,
        page
      }
    )
    return await sendSuccessResponse(
      res,
      {
        properties: properties.results.map((property) =>
          serializeDto<Property>(property)
        )
      },
      200,
      req
    )
  }
  async deleteProperty(
    req: Request<DeletePropertyRequestParams, any, DeletePropertyRequestBody>,
    res: Response<DeletePropertyResponse>
  ) {
    const filter = filterProtection(
      {
        _id: req.params.id
      },
      RequestTypes.Delete,
      req.user
    )
    const { reasonDelete } = req.body
    const currentProperty = await propertyService.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound
    })
    await propertyService.update(
      {
        _id: currentProperty!._id
      },
      {
        reasonDelete
      },
      { actor: getActorData(req) }
    )
    const property = await propertyService.delete(
      {
        _id: currentProperty!._id,
        ...filter
      },
      { actor: getActorData(req) }
    )
    if (property?.project) {
      await projectPropertyCombinedService.setNewUnitsAfterDelete(property)
    }
    return sendSuccessResponse(
      res,
      {
        property: serializeDto<Property>(property)
      },
      204
    )
  }
}

function getBoundingBox(lat: number, lng: number, radius: number) {
  const latDelta = radius / 111.32 // Latitude degrees per km
  const lngDelta = radius / (111.32 * Math.cos((lat * Math.PI) / 180)) // Longitude degrees per km
  const minLat = lat - latDelta
  const maxLat = lat + latDelta
  const minLng = lng - lngDelta
  const maxLng = lng + lngDelta

  return {
    minLat,
    maxLat,
    minLng,
    maxLng
  }
}
export const propertyController = new PropertyController()
