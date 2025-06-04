import { Location } from '@commonTypes'
import { env } from '@config'
import {
  getNominatimOpenStreetsMapUrl,
  GOOGLE_MAPS_APIS,
  MESSAGES
} from '@constants'
import {
  AppError,
  GoogleGeoJSONResponse,
  GoogleLocation,
  GoogleSearchJSONResponse,
  GoogleSearchPlaceQuery
} from '@contracts'
import axios from 'axios'

import { loggerService } from './logger.service'

interface GetFormattedAddressOptions {
  lat: number
  lng: number
  address: string
  country?: string
}
class GoogleServices {
  constructor() {}

  private async getFormattedAddress({
    lat,
    lng,
    address,
    country: argCountry
  }: GetFormattedAddressOptions): Promise<Location> {
    const addressParts = address.split(' - ')
    const defaultCountry = argCountry || (await this.getLocationInfo(lat, lng))

    if (addressParts.length >= 4) {
      const [street = '', neighborhoods = '', city = '', country = ''] =
        addressParts
      return {
        name: '',
        neighborhoods,
        address,
        street,
        country: country || defaultCountry,
        state: city,
        city,
        coordinates: []
      }
    }

    const [neighborhoods = '', city = '', country = ''] = addressParts
    return {
      name: '',
      neighborhoods,
      address,
      country: country || defaultCountry,
      state: city,
      city,
      street: '',
      coordinates: []
    }
  }

  async getPlaceDetails({ lat, lng }: GoogleLocation) {
    if (!lat || !lng) {
      throw new AppError(MESSAGES.missingData('lat', 'lng'), 400)
    }

    try {
      const response = await axios.get<GoogleGeoJSONResponse>(
        GOOGLE_MAPS_APIS.GOOGLE_GEOCODE_API,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: env.GOOGLE_API_KEY
          }
        }
      )
      const results = response.data?.results
      if (!results?.length) {
        throw new AppError('No results found for this location', 404)
      }
      // Find address with 4 components first, fallback to 3 components
      const addressResult =
        results.find(
          (item) => item.formatted_address?.split(' - ').length === 4
        ) ||
        results.find(
          (item) => item.formatted_address?.split(' - ').length === 3
        )

      if (!addressResult) {
        throw new AppError('No formatted address found for this location', 404)
      }

      const partialLocation = await this.getFormattedAddress({
        lat,
        lng,
        address: addressResult.formatted_address
      })
      return { ...partialLocation, coordinates: [lat, lng] }
    } catch (error) {
      loggerService.error(`Error getting place details from google: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
  }

  async getLocationInfo(lat: number, lng: number) {
    try {
      const response = await axios.get(getNominatimOpenStreetsMapUrl(lat, lng))
      return response.data.address?.country
    } catch {
      return 'United Arab Emirates'
    }
  }
  async searchPlace({ query }: GoogleSearchPlaceQuery) {
    const region = 'AE'
    const response = await axios.get<GoogleSearchJSONResponse>(
      GOOGLE_MAPS_APIS.GOOGLE_PLACES_TEXT_SEARCH,
      {
        params: {
          region,
          query: `${query.toLowerCase()} in UAE`,
          key: env.GOOGLE_API_KEY
        }
      }
    )

    const places = await Promise.all(
      response?.data?.results.map(async (place) => {
        return {
          ...(await this.getFormattedAddress({
            lat: place?.geometry?.location?.lat,
            lng: place?.geometry?.location?.lng,
            address: place.formatted_address,
            country: 'United Arab Emirates'
          })),
          name: place.name,
          coordinates: [
            place?.geometry?.location?.lat,
            place?.geometry?.location?.lng
          ]
        }
      }) ?? []
    )
    return places
  }
}

export const googleServices = new GoogleServices()
