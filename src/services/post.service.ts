import { CreatePostDto, DeleteExtraConfig, IPostDocument } from '@contracts'
import { PostModel } from '@models'
import { FilterQuery } from 'mongoose'

import { BaseService } from './base.service'
import { commentService } from './comment.service'
import { communityInteractionsService } from './community-interactions.service'
import { likeService } from './like.service'
import { loggerService } from './logger.service'
import { postSaveService } from './post-save.service'
import { userViewPostsService } from './user-view-posts.service'

class PostService extends BaseService<IPostDocument, CreatePostDto> {
  constructor() {
    super(PostModel)
  }
  override async deleteMany(
    filter: FilterQuery<IPostDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allPosts = await PostModel.find({
      ...filter,
      deletedAt: null
    })
      .session(extraConfig?.session || null)
      .select('_id deletedAt')
    for (const post of allPosts) {
      if (!post.deletedAt) {
        await this.delete({ _id: post._id }, extraConfig)
      }
    }
  }
  override async delete(
    filter: FilterQuery<IPostDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<IPostDocument> {
    await Promise.all([
      commentService.deleteMany({ post: filter._id }, extraConfig),
      likeService.deleteMany({ post: filter._id }, extraConfig),
      postSaveService.deleteMany({ post: filter._id }, extraConfig),
      communityInteractionsService.delete({ post: filter._id }, extraConfig),
      userViewPostsService.deleteMany({ post: filter._id }, extraConfig)
    ])
    loggerService.info('Deleting postasdfklhjnqjkdfrhawkldjsfhasldf...')
    loggerService.info(JSON.stringify(filter, null, 2))

    return await super.delete(filter, extraConfig)
  }

  override async hardDelete(
    filter: FilterQuery<IPostDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    await Promise.all([
      commentService.hardDeleteMany({ post: filter._id }, extraConfig),
      likeService.hardDeleteMany({ post: filter._id }, extraConfig),
      postSaveService.hardDeleteMany({ post: filter._id }, extraConfig),
      communityInteractionsService.hardDelete(
        { post: filter._id },
        extraConfig
      ),
      userViewPostsService.hardDeleteMany({ post: filter._id }, extraConfig)
    ])
    return await super.hardDelete(filter, extraConfig)
  }

  override async hardDeleteMany(
    filter: FilterQuery<IPostDocument>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const allPosts = await PostModel.find({ ...filter })
      .session(extraConfig?.session || null)
      .select('_id')
    for (const post of allPosts) {
      await this.hardDelete({ _id: post._id }, extraConfig)
    }
  }
}

export const postService = new PostService()
