import { CreateOfficialBlogDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldOfficialBlog } from 'scripts/interfaces-v1'

export const officialBlogsMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedOfficialBlogs: OldOfficialBlog[] = []
  let insertedOfficialBlogs: number = 0
  try {
    const sourceOfficialBlogModel = sourceDB?.collection('blogs')
    const targetOfficialBlogModel = targetDB?.collection('blogs')
    const targetUserModel = targetDB?.collection('users')

    const sourceOfficialBlogs = await sourceOfficialBlogModel
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    for (let index = 0; index < sourceOfficialBlogs.length; index++) {
      const officialBlog = sourceOfficialBlogs[index]
      const officialBlogWithType: OldOfficialBlog =
        officialBlog as unknown as OldOfficialBlog

      // Check if user exists
      const user = await targetUserModel?.findOne({
        _id: officialBlogWithType.user
      })
      if (!user) {
        logger(
          `Skipping official blog ${officialBlogWithType._id} - user not found with id: ${officialBlogWithType.user}`
        )
        passedOfficialBlogs.push(officialBlogWithType)
        continue
      }
      let shouldSkip = false
      for (const relatedBlogId of officialBlogWithType.relatedBlogs) {
        const relatedBlog = await sourceOfficialBlogModel?.findOne({
          _id: relatedBlogId
        })
        if (!relatedBlog) {
          logger(
            `Related blog not found with id: ${relatedBlogId}, skipping...`
          )
          passedOfficialBlogs.push(officialBlogWithType)
          shouldSkip = true
          break
        }
      }
      if (shouldSkip) {
        continue
      }
      if (officialBlogWithType.media.length === 0) {
        logger(
          `Official blog ${officialBlogWithType._id} has no hero media, skipping...`
        )
        passedOfficialBlogs.push(officialBlogWithType)
        continue
      }
      logger(`Inserting official blog: ${officialBlogWithType._id}`)
      const newOfficialBlog: Omit<
        CreateOfficialBlogDto,
        'user' | 'createdBy' | 'relatedBlogs'
      > & {
        _id: Types.ObjectId
        deletedAt: Date | null
        createdAt: Date
        updatedAt: Date
        user: Types.ObjectId
        createdBy: Types.ObjectId
        relatedBlogs: Types.ObjectId[]
      } = {
        _id: new Types.ObjectId(officialBlogWithType._id.toString()),
        createdAt: officialBlogWithType.createdAt,
        updatedAt: officialBlogWithType.updatedAt,
        user: officialBlogWithType.user,
        title: officialBlogWithType.title,
        description: officialBlogWithType.description,
        media: officialBlogWithType.media[0]!,
        content: officialBlogWithType.content,
        tableOfContents: officialBlogWithType.tableOfContents,
        faq: officialBlogWithType.faq,
        seo: officialBlogWithType.seo,
        slug: officialBlogWithType.slug,
        published: officialBlogWithType.published,
        createdBy: officialBlogWithType.user,
        relatedBlogs: officialBlogWithType.relatedBlogs.map(
          (blog) => new Types.ObjectId(blog.toString())
        ),
        deletedAt: null,
        scheduledAt: officialBlogWithType.scheduledAt ?? undefined
      }
      await targetOfficialBlogModel?.insertOne(newOfficialBlog)
      insertedOfficialBlogs++
    }

    logger('Official blog migration completed')
    logger(`There are ${insertedOfficialBlogs} official blogs inserted`)
    if (passedOfficialBlogs.length > 0) {
      logger(`There are ${passedOfficialBlogs.length} official blogs passed`)
      logger(passedOfficialBlogs)
    }
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
