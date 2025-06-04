interface GooglePlusCode {
  compound_code: string
  global_code: string
}

export interface GoogleLocation {
  lat: number
  lng: number
}

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GoogleBounds {
  northeast: GoogleLocation
  southwest: GoogleLocation
}

interface GoogleGeometry {
  location: GoogleLocation
  location_type: string
  viewport: GoogleBounds
  bounds?: GoogleBounds
}

interface GooglePlacesResult {
  address_components: AddressComponent[]
  formatted_address: string
  geometry: GoogleGeometry
  place_id: string
  types: string[]
  name: string
  plus_code?: GooglePlusCode
}

interface GoogleSearchResult {
  business_status: string
  formatted_address: string
  geometry: GoogleGeometry
  icon: string
  icon_background_color: string
  icon_mask_base_uri: string
  name: string
  opening_hours?: GoogleOpeningHours
  photos: GooglePhoto[]
  place_id: string
  plus_code?: GooglePlusCode
  rating: number
  reference: string
  types: string[]
  user_ratings_total: number
}
interface GoogleOpeningHours {
  open_now: boolean
}

interface GooglePhoto {
  height: number
  html_attributions: string[]
  photo_reference: string
  width: number
}

export interface GoogleGeoJSONResponse {
  plus_code: GooglePlusCode
  results: GooglePlacesResult[]
  status: string
}

export interface GoogleSearchJSONResponse {
  html_attributions: any[]
  results: GoogleSearchResult[]
  status: string
}

export interface GoogleSearchPlaceQuery {
  query: string
}
