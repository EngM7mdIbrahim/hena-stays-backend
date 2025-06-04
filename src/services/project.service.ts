import {
  CreateProjectDto,
  DeleteExtraConfig,
  IProjectDocument
} from '@contracts'
import { ProjectModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'
import { propertyService } from './property.service'

class ProjectService extends BaseService<IProjectDocument, CreateProjectDto> {
  constructor() {
    super(ProjectModel)
  }
  override async delete(
    filter: FilterQuery<IProjectDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<IProjectDocument> {
    await propertyService.deleteMany({ project: filter._id }, extraConfig)
    return await super.delete(filter, extraConfig)
  }
  override async deleteMany(
    filter: FilterQuery<IProjectDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allProjects = await ProjectModel.find({
      ...filter,
      deletedAt: null
    })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const project of allProjects) {
      await this.delete({ _id: project._id }, extraConfig)
    }
  }
  override async hardDeleteMany(
    filter: FilterQuery<IProjectDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allProjects = await ProjectModel.find({ ...filter })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const project of allProjects) {
      await this.hardDelete({ _id: project._id }, extraConfig)
    }
  }
  override async hardDelete(
    filter: FilterQuery<IProjectDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    await propertyService.hardDeleteMany({ project: filter._id }, extraConfig)
    return await super.hardDelete(filter, extraConfig)
  }
}

export const projectService = new ProjectService()
