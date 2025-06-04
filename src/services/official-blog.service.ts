import { ActionToTakeTypes } from '@commonTypes'
import {
  CreateOfficialBlogDto,
  DeleteExtraConfig,
  IOfficialBlogDocument
} from '@contracts'
import { OfficialBlogModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'

class OfficialBlogService extends BaseService<
  IOfficialBlogDocument,
  CreateOfficialBlogDto
> {
  constructor() {
    super(OfficialBlogModel)
  }

  override async delete(
    filter: FilterQuery<IOfficialBlogDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<IOfficialBlogDocument> {
    const officialBlog = await this.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound
    })
    const officialBlogs = await OfficialBlogModel.find({
      relatedBlogs: { $in: [officialBlog._id] }
    }).session(extraConfig?.session || null)
    const promiseUpdatedBlogs = officialBlogs.map((blog) => {
      blog.relatedBlogs = blog.relatedBlogs.filter(
        (relatedBlog) => relatedBlog.toString() !== officialBlog._id.toString()
      )
      return blog.save({ session: extraConfig?.session || null })
    })
    await Promise.all(promiseUpdatedBlogs)
    return await super.delete(filter, {
      ...extraConfig
    })
  }

  override async deleteMany(
    filter: FilterQuery<IOfficialBlogDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allBlogs = await OfficialBlogModel.find({
      ...filter,
      deletedAt: null
    })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const blog of allBlogs) {
      await this.delete({ _id: blog._id }, extraConfig)
    }
  }

  async publishScheduledBlogs(): Promise<void> {
    await OfficialBlogModel.updateMany(
      { scheduledAt: { $lte: new Date() }, published: false },
      { $set: { published: true, scheduledAt: null } }
    )
  }
}

export const officialBlogService = new OfficialBlogService()
