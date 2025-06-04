import { IPropertyDocument } from '@contracts'
import { projectService, propertyService } from '@services'
import { Types } from 'mongoose'

class ProjectPropertyCombinedService {
  constructor() {}
  /**
   * Updates or adds new project units based on the given property details.
   *
   * @param {IPropertyDocument} property - The property document containing unit details.
   * @returns {Promise<any>} - The updated project or null if the project does not exist.
   */
  async setNewProjectUnits(property: IPropertyDocument): Promise<void> {
    // Fetch the project associated with the property
    const project = (await projectService.readOne({ _id: property.project }))!
    // Exit if project not found
    if (!project) {
      return
    }

    // Destructure units and startingPrice from the project
    let { startingPrice = Number.MAX_SAFE_INTEGER } = project
    const { units = [] } = project
    startingPrice =
      startingPrice === 0 ? Number.MAX_SAFE_INTEGER : startingPrice
    // Extract property details
    const propertySubCategory = property?.subCategory?.toString()
    const propertyAreaBuiltIn = property?.area?.builtIn ?? 0
    const propertyPriceValue = property?.price?.value
    let unitExists = false
    const unit = units.find((unit) => {
      return unit?.subCategory?.toString() === propertySubCategory
    })
    // If a unit with the same subCategory exists, update its area and price
    if (unit) {
      unit.area.to = Math.max(unit.area.to, propertyAreaBuiltIn)
      unit.area.from = Math.min(unit.area.from, propertyAreaBuiltIn)
      unit.price.to = Math.max(unit.price.to, propertyPriceValue)
      unit.price.from = Math.min(
        unit.price.from,
        propertyPriceValue ?? Number.MAX_SAFE_INTEGER
      )
      unitExists = true
    }

    // If no matching unit exists, add a new unit entry
    if (!unitExists) {
      units.push({
        category: property?.category,
        subCategory: property?.subCategory,
        area: { from: propertyAreaBuiltIn, to: propertyAreaBuiltIn },
        price: { from: propertyPriceValue, to: propertyPriceValue }
      })
    }

    // Update the project's starting price with the minimum price value
    project.startingPrice = Math.min(propertyPriceValue, startingPrice)
    // Save the updated project
    await project.save()
  }

  /**
   * Updates or adds new project units based on the given property details.
   *
   * @param {IPropertyDocument} property - The property document containing unit details.
   * @returns {Promise<any>} - The updated project or null if the project does not exist.
   */
  async setNewUnitsAfterDelete(property: IPropertyDocument): Promise<void> {
    // Fetch the project associated with the property
    const project = await projectService.readOne({ _id: property.project })
    if (!project) {
      // Exit if project not found
      return
    }

    let units = project?.units ?? []
    // Check if a unit with the same subCategory exists in the project
    const checkIfExist = units.find(
      (unit) =>
        unit?.subCategory?.toString() === property?.subCategory?.toString()
    )

    if (checkIfExist) {
      // Fetch the minimum and maximum area and price values for the subCategory
      const [
        minPropArea,
        minPropPrice,
        maxPropArea,
        maxPropPrice,
        minPriceGeneral
      ] = await Promise.all([
        // Find the minimum area for the subCategory
        propertyService.readOne(
          {
            _id: { $ne: property?._id },
            category: property?.category,
            subCategory: property?.subCategory,
            project: project?._id
          },
          {
            sort: { 'area.builtIn': 1 }
          }
        ),
        // Find the minimum price for the subCategory
        propertyService.readOne(
          {
            _id: { $ne: property?._id },
            category: property?.category,
            subCategory: property?.subCategory,
            project: project?._id
          },
          {
            sort: { 'price.value': 1 }
          }
        ),
        // Find the maximum area for the subCategory
        propertyService.readOne(
          {
            _id: { $ne: property?._id },
            category: property?.category,
            subCategory: property?.subCategory,
            project: project?._id
          },
          {
            sort: { 'area.builtIn': -1 }
          }
        ),
        // Find the maximum price for the subCategory
        propertyService.readOne(
          {
            _id: { $ne: property?._id },
            category: property?.category,
            subCategory: property?.subCategory,
            project: project?._id
          },
          {
            sort: { 'price.value': -1 }
          }
        ),
        // Find the minimum price for the project
        propertyService.readOne(
          {
            _id: { $ne: property?._id },
            project: project?._id
          },
          {
            sort: { 'price.value': 1 }
          }
        )
      ])

      // If no other property exists for the subCategory, remove the unit from the project
      if (!minPropArea || !minPropPrice || !maxPropArea || !maxPropPrice) {
        units = units.filter(
          (unit) =>
            unit?.subCategory?.toString() !== property?.subCategory?.toString()
        )
        project.units = units
        project.startingPrice = minPriceGeneral?.price?.value ?? 0
      } else {
        // If a property exists for the subCategory, update the area and price values
        if (property?.area?.builtIn === checkIfExist?.area?.from) {
          checkIfExist.area!.from = minPropArea?.area?.builtIn ?? 0
        }
        if (property?.area?.builtIn === checkIfExist?.area?.to) {
          checkIfExist.area!.to = maxPropArea?.area?.builtIn ?? 0
        }
        if (property?.price?.value === checkIfExist?.price?.from) {
          checkIfExist.price!.from = minPropPrice?.price?.value ?? 0
          if (project?.startingPrice === checkIfExist?.price?.from) {
            project.startingPrice = minPropPrice?.price?.value ?? 0
          }
        }
        if (property?.price?.value === checkIfExist?.price?.to) {
          checkIfExist.price!.to = maxPropPrice?.price?.value ?? 0
        }
        project.startingPrice = minPriceGeneral?.price?.value ?? 0
      }

      // Save the updated project
      await project.save()
    } else return
  }

  async setUpdateProjectUnits(
    categoryId: string,
    subCategoryId: string,
    projectId: string
  ) {
    const project = await projectService.readOne({ _id: projectId })
    if (!project) return
    const units = project?.units ?? []
    const unit = units.find(
      (unit) => unit?.subCategory.toString() === subCategoryId.toString()
    )

    const [
      minPropArea,
      minPropPrice,
      maxPropArea,
      maxPropPrice,
      minPriceGeneral
    ] = await Promise.all([
      // Find the minimum area for the subCategory
      propertyService.readOne(
        {
          subCategory: subCategoryId,
          project: project?._id
        },
        {
          sort: { 'area.builtIn': 1 }
        }
      ),
      // Find the minimum price for the subCategory
      propertyService.readOne(
        {
          subCategory: subCategoryId,
          project: project?._id
        },
        {
          sort: { 'price.value': 1 }
        }
      ),
      // Find the maximum area for the subCategory
      propertyService.readOne(
        {
          subCategory: subCategoryId,
          project: project?._id
        },
        {
          sort: { 'area.builtIn': -1 }
        }
      ),
      // Find the maximum price for the subCategory
      propertyService.readOne(
        {
          subCategory: subCategoryId,
          project: project?._id
        },
        {
          sort: { 'price.value': -1 }
        }
      ),
      // Find the minimum price for the project
      propertyService.readOne(
        {
          project: project?._id
        },
        {
          sort: { 'price.value': 1 }
        }
      )
    ])
    if (!unit) {
      units.push({
        category: new Types.ObjectId(categoryId),
        subCategory: new Types.ObjectId(subCategoryId),
        area: {
          from: minPropArea?.area?.builtIn ?? 0,
          to: maxPropArea?.area?.builtIn ?? 0
        },
        price: {
          from: minPropPrice?.price?.value ?? 0,
          to: maxPropPrice?.price?.value ?? 0
        }
      })
      project.units = units
      await project.save()
      return
    }
    unit.area.to = maxPropArea?.area?.builtIn ?? 0
    unit.area.from = minPropArea?.area?.builtIn ?? 0
    unit.price.to = maxPropPrice?.price?.value ?? 0
    unit.price.from = minPropPrice?.price?.value ?? 0
    project.startingPrice = minPriceGeneral?.price?.value ?? 0
    await project.save()
    return
  }
}

export const projectPropertyCombinedService =
  new ProjectPropertyCombinedService()
