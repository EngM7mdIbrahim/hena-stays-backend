import {
  ActionToTakeTypes,
  AddAmenityRequest,
  AddAmenityResponse,
  Amenity,
  DeleteAmenityRequestParams,
  DeleteAmenityResponse,
  FindAllAmenitiesRequestQuery,
  FindAllAmenitiesResponse,
  GetAmenityRequestParams,
  GetAmenityResponse,
  UpdateAmenityRequestBody,
  UpdateAmenityRequestParams,
  UpdateAmenityResponse
} from '@commonTypes'
import { amenityService } from '@services'
import { Request, Response } from 'express'

import {
  getActorData,
  getPaginationData,
  sendSuccessResponse,
  serializeDto
} from '@utils'

class AmenityController {
  async getAll(
    req: Request<any, any, any, FindAllAmenitiesRequestQuery>,
    res: Response<FindAllAmenitiesResponse>
  ) {
    const { limit, page, sort, filter } = getPaginationData(req.query)

    const amenities = await amenityService.findAll(filter, {
      limit,
      page,
      sort
    })
    sendSuccessResponse(res, {
      items: amenities.results.map((amenity) => serializeDto<Amenity>(amenity)),
      total: amenities.totalResults,
      limit,
      page,
      totalPages: amenities.totalPages,
      hasNext: amenities.page < amenities.totalPages,
      nextPage:
        amenities.page < amenities.totalPages ? amenities.page + 1 : undefined
    })
  }

  async getOne(
    req: Request<GetAmenityRequestParams, any, any, any>,
    res: Response<GetAmenityResponse>
  ) {
    const amenity = await amenityService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { amenity: serializeDto<Amenity>(amenity!) })
  }

  async create(
    req: Request<any, any, AddAmenityRequest>,
    res: Response<AddAmenityResponse>
  ) {
    const amenity = await amenityService.create(req.body, {
      actor: getActorData(req)
    })
    sendSuccessResponse(res, { amenity: serializeDto<Amenity>(amenity) })
  }

  async update(
    req: Request<UpdateAmenityRequestParams, any, UpdateAmenityRequestBody>,
    res: Response<UpdateAmenityResponse>
  ) {
    let amenity = await amenityService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    await amenityService.update({ _id: req.params.id }, req.body, {
      actor: getActorData(req)
    })
    amenity = await amenityService.readOne(
      { _id: req.params.id },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    sendSuccessResponse(res, { amenity: serializeDto<Amenity>(amenity) })
  }

  async delete(
    req: Request<DeleteAmenityRequestParams>,
    res: Response<DeleteAmenityResponse>
  ) {
    const amenity = await amenityService.delete(
      { _id: req.params.id },
      { actor: getActorData(req) }
    )
    sendSuccessResponse(res, { amenity: serializeDto<Amenity>(amenity) }, 204)
  }
}

export const amenityController = new AmenityController()
