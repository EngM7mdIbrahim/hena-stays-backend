import {
  CreateCommentDto,
  DeleteExtraConfig,
  ICommentDocument
} from '@contracts'
import { CommentModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'
import { likeService } from './like.service'
import { loggerService } from './logger.service'

class CommentService extends BaseService<ICommentDocument, CreateCommentDto> {
  constructor() {
    super(CommentModel)
  }

  override async deleteMany(
    filter: FilterQuery<ICommentDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    loggerService.debug('Deleting comments...')
    const allComments = await CommentModel.find({
      ...filter,
      deletedAt: null
    })
      .session(extraConfig?.session || null)
      .select('_id deletedAt')

    for (const comment of allComments) {
      await this.delete({ _id: comment._id }, extraConfig)
    }
  }

  override async delete(
    filter: FilterQuery<ICommentDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<ICommentDocument> {
    await likeService.deleteMany({ comment: filter._id }, extraConfig)
    return await super.delete(filter, extraConfig)
  }

  override async hardDelete(
    filter: FilterQuery<ICommentDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    await likeService.hardDeleteMany({ comment: filter._id }, extraConfig)
    return await super.hardDelete(filter, extraConfig)
  }

  override async hardDeleteMany(
    filter: FilterQuery<ICommentDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allComments = await CommentModel.find({
      ...filter
    })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const comment of allComments) {
      await this.hardDelete({ _id: comment._id }, extraConfig)
    }
  }
}

export const commentService = new CommentService()
