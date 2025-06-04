import {
  PropertiesAnalytics,
  PropertyStatusEnum,
  RecommendationTypeEnum,
  RentDurationEnum,
  SaleTypeEnum
} from '@commonTypes'
import {
  CreatePropertyDto,
  DeleteExtraConfig,
  IPropertyDocument
} from '@contracts'
import { PropertyModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'
import { interactionsService } from './interactions.service'
import { leadsService } from './leads.service'
import { propertySaveService } from './property-save.service'
import { userViewsPropertiesService } from './user-view-properties.service'

class PropertyService extends BaseService<
  IPropertyDocument,
  CreatePropertyDto
> {
  constructor() {
    super(PropertyModel)
  }

  override async delete(
    filter: FilterQuery<IPropertyDocument>,
    extraConfig: DeleteExtraConfig
  ) {
    await interactionsService.delete({ property: filter._id }, extraConfig)
    await Promise.all([
      propertySaveService.deleteMany({ property: filter._id }, extraConfig),
      userViewsPropertiesService.deleteMany(
        { property: filter._id },
        extraConfig
      ),
      leadsService.deleteMany({ property: filter._id }, extraConfig)
    ])
    return await super.delete(filter, extraConfig)
  }

  override async deleteMany(
    filter: FilterQuery<IPropertyDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allProperties = await PropertyModel.find({
      ...filter,
      deletedAt: null
    })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const property of allProperties) {
      await this.delete({ _id: property._id }, extraConfig)
    }
  }

  override async hardDeleteMany(
    filter: FilterQuery<IPropertyDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allProperties = await PropertyModel.find({ ...filter })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const property of allProperties) {
      await this.hardDelete({ _id: property._id }, extraConfig)
    }
  }

  override async hardDelete(
    filter: FilterQuery<IPropertyDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    await interactionsService.hardDelete({ property: filter._id }, extraConfig)
    await Promise.all([
      leadsService.hardDeleteMany({ property: filter._id }, extraConfig),
      propertySaveService.hardDeleteMany({ property: filter._id }, extraConfig),
      userViewsPropertiesService.hardDeleteMany(
        { property: filter._id },
        extraConfig
      )
    ])
    return await super.hardDelete(filter, extraConfig)
  }

  async propertiesAnalytics(
    filter: Record<string, any> = {}
  ): Promise<PropertiesAnalytics> {
    const aggregationPipeline = [
      {
        $match: {
          ...filter,
          deletedAt: null
        }
      },
      {
        $lookup: {
          from: 'subcategories', // The name of the category collection
          localField: 'subCategory',
          foreignField: '_id',
          as: 'subCategoryDetails'
        }
      },
      {
        $unwind: '$subCategoryDetails'
      },
      {
        $facet: {
          totalActiveInactive: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          totalPerCategory: [
            {
              $match: {
                status: 'Active' // Only include active properties
              }
            },
            {
              $group: {
                _id: '$subCategoryDetails._id',
                name: { $first: '$subCategoryDetails.name' },
                count: { $sum: 1 }
              }
            }
          ],
          totalSaleRent: [
            {
              $match: {
                status: 'Active' // Only include active properties
              }
            },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          averagePrices: [
            {
              $match: {
                status: 'Active' // Only include active properties
              }
            },
            {
              $group: {
                _id: {
                  type: '$type',
                  duration: {
                    $cond: {
                      if: { $eq: ['$type', 'Rent'] },
                      then: '$price.duration',
                      else: null
                    }
                  }
                },
                averagePrice: { $avg: '$price.value' }
              }
            }
          ]
        }
      }
    ]

    const result = await PropertyModel.aggregate(aggregationPipeline).exec()
    // Process the result to match your desired output format
    const processedResult: PropertiesAnalytics = {
      totalActiveProperties:
        result[0].totalActiveInactive.find(
          (item: any) => item._id === PropertyStatusEnum.Active
        )?.count || 0,
      totalInactiveProperties:
        result[0].totalActiveInactive.find(
          (item: any) => item._id === PropertyStatusEnum.Inactive
        )?.count || 0,
      totalPerCategory: result[0].totalPerCategory,
      totalSale:
        result[0].totalSaleRent.find(
          (item: any) => item._id === SaleTypeEnum.Sale
        )?.count || 0,
      totalRent:
        result[0].totalSaleRent.find(
          (item: any) => item._id === SaleTypeEnum.Rent
        )?.count || 0,
      averageSellingPrice: Math.ceil(
        result[0].averagePrices.find(
          (item: any) => item._id.type === SaleTypeEnum.Sale
        )?.averagePrice || 0
      ),
      averageRentingPriceDaily: Math.ceil(
        result[0].averagePrices.find(
          (item: any) =>
            item._id.type === SaleTypeEnum.Rent &&
            item._id.duration === RentDurationEnum.Daily
        )?.averagePrice || 0
      ),
      averageRentingPriceMonthly: Math.ceil(
        result[0].averagePrices.find(
          (item: any) =>
            item._id.type === SaleTypeEnum.Rent &&
            item._id.duration === RentDurationEnum.Monthly
        )?.averagePrice || 0
      ),
      averageRentingPriceYearly: Math.ceil(
        result[0].averagePrices.find(
          (item: any) =>
            item._id.type === SaleTypeEnum.Rent &&
            item._id.duration === RentDurationEnum.Yearly
        )?.averagePrice || 0
      )
    }
    return processedResult
  }
  async getTopProperties(
    filter: FilterQuery<IPropertyDocument> = {}
    // limit: number = 3
  ) {
    const aggregationPipeline = [
      {
        $match: {
          ...filter,
          deletedAt: null
        }
      }
    ]
    const result = await PropertyModel.aggregate(aggregationPipeline).exec()
    return result[0]
  }

  async updateExpiredRecommendations() {
    const properties = await PropertyModel.find({
      recommended: { $ne: RecommendationTypeEnum.None },
      recommendationExpiresAt: { $exists: true, $ne: null, $lt: new Date() }
    }).select('_id recommended recommendationExpiresAt')
    await PropertyModel.updateMany(
      {
        _id: { $in: properties.map((property) => property._id) }
      },
      {
        $set: {
          recommended: RecommendationTypeEnum.None,
          recommendationExpiresAt: null
        }
      }
    )
  }
}

export const propertyService = new PropertyService()
