import { Db } from 'mongodb'
import { OldOfficialBlog } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getOfficialBlogsWithNoUser = async (sourceDB: Db) => {
  const officialBlogsMissingUsers: OldOfficialBlog[] = []
  const officialBlogs = ((await sourceDB
    .collection('officialBlogs')
    .find({})
    .toArray()) ?? []) as OldOfficialBlog[]
  for (const officialBlog of officialBlogs) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: officialBlog.user })
    if (!user) {
      officialBlogsMissingUsers.push(officialBlog)
    }
  }
  return officialBlogsMissingUsers
}

export const filterOfficialBlogs = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for official with no user in the users array...')
  const officialBlogsWithNoUser = await getOfficialBlogsWithNoUser(sourceDB)
  logger(`Found ${officialBlogsWithNoUser.length} official blogs with no user:`)
  logger(officialBlogsWithNoUser)
  logger('Checking for deleted official blogs...')
  const deletedOfficialBlogs = await getDeletedEntities<OldOfficialBlog>(
    sourceDB,
    'blogs'
  )
  logger(
    `Found ${deletedOfficialBlogs.length} deleted official blogs in the database:`
  )
  logger(deletedOfficialBlogs)
  const uniqueOfficialBlogs = getUniqueEntities<OldOfficialBlog>([
    ...deletedOfficialBlogs,
    ...officialBlogsWithNoUser
  ])
  if (uniqueOfficialBlogs.length > 0) {
    logger(`Deleting ${uniqueOfficialBlogs.length} official blogs...`)
    for (const officialBlog of uniqueOfficialBlogs) {
      await deleteEntity(
        sourceDB,
        'blogs',
        'blog',
        { _id: officialBlog._id },
        logger
      )
    }
  } else {
    logger('No official blogs to delete, skipping filtering ...')
  }
}
