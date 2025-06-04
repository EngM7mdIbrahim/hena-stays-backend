import {
  PlaceDetailsRequestQuery,
  PlaceDetailsResponse,
  SearchPlaceRequestQuery,
  SearchPlaceResponse
} from '@commonTypes'
import { googleServices } from '@services'
import { Request, Response } from 'express'

import { sendSuccessResponse } from '@utils'

class GoogleController {
  async searchPlace(
    req: Request<any, any, any, SearchPlaceRequestQuery>,
    res: Response<SearchPlaceResponse>
  ) {
    const { text } = req.query
    const places = await googleServices.searchPlace({ query: text })
    return sendSuccessResponse(res, { places })
  }

  async getPlaceDetails(
    req: Request<any, any, any, PlaceDetailsRequestQuery>,
    res: Response<PlaceDetailsResponse>
  ) {
    const { lat, lng } = req.query
    const place = await googleServices.getPlaceDetails({
      lat: Number(lat),
      lng: Number(lng)
    })
    return sendSuccessResponse(res, {
      place: { ...place, name: place.country }
    })
  }
}

export const googleController = new GoogleController()
