import { DEFAULT_AMENITIES } from '@constants'
import { amenityService, loggerService } from '@services'

import { getActorData, imageUploader } from '@utils'

/**
 * Create default amenities if they don't exist
 * @returns Array of processed amenities with IDs
 */
export async function createDefaultAmenities() {
  try {
    for (const amenity of DEFAULT_AMENITIES) {
      // Check if the amenity exists in the database
      const existingAmenity = await amenityService.readOne({
        code: amenity.code
      })

      if (existingAmenity) {
        // Add the ID to the processed amenity
        amenity._id = existingAmenity._id.toString()
      } else {
        // If it doesn't exist, create it
        // Upload the image
        const imageResponse = await imageUploader(amenity.image)

        // Create the amenity
        const newAmenity = await amenityService.create(
          {
            name: amenity.name,
            code: amenity.code,
            image: imageResponse.url || ''
          },
          { actor: getActorData() }
        )

        amenity._id = newAmenity._id.toString()
      }
    }
  } catch (error) {
    loggerService.error('Error creating default amenities')
    throw error
  }
}
