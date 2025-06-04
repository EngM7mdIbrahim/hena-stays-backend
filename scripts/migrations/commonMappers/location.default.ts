import { Location } from '@commonTypes'

export const DEFAULT_MAP_POSITION: Location = {
  address: '77GW+JQ9 - Corniche Deira - Dubai - United Arab Emirates',
  name: 'Corniche Deira',
  street: '77GW+JQ9',
  neighborhoods: 'Corniche Deira',
  country: 'United Arab Emirates',
  state: 'Dubai',
  city: 'Dubai',
  coordinates: [25.2855, 55.326]
}

export const getLocationIfNotExists = (location: any): Location => {
  if (
    !location ||
    (!location.lat && !location.lng) ||
    !location.name ||
    !location.country
  ) {
    return DEFAULT_MAP_POSITION
  }
  return {
    address: location?.address ?? '',
    name: location?.name ?? '',
    country: location?.country ?? '',
    state: location?.state ?? '',
    city: location?.city ?? '',
    coordinates: [location?.lat ?? 0, location?.lng ?? 0],
    neighborhoods: location?.neighborhoods ?? '',
    street: location?.street ?? ''
  }
}
