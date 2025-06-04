export const GOOGLE_MAPS_APIS = {
  GOOGLE_BASE_URL: 'https://maps.googleapis.com/maps/api',
  GOOGLE_GEOCODE_API: 'https://maps.googleapis.com/maps/api/geocode/json',
  GOOGLE_PLACES_TEXT_SEARCH:
    'https://maps.googleapis.com/maps/api/place/textsearch/json'
}

export const OPEN_STREET_MAP_URL = {
  OPEN_STREET_MAP_URL: `https://nominatim.openstreetmap.org/reverse`
}

export const getNominatimOpenStreetsMapUrl = (lat: number, lng: number) => {
  return `${OPEN_STREET_MAP_URL.OPEN_STREET_MAP_URL}?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
}
