import { ObjectId } from 'bson'
import { Db, Document, Filter } from 'mongodb'
import { OldUser } from 'scripts/interfaces-v1'

import { checkIfUnique } from './common/check-if-unique'
import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'
import { mergeEntity } from './common/merge-entity'

export const testingUsers = [
  '6682b28a6a09efa0231bd547',
  '671629be2994bdbdeefc1e2f',
  '6693815b89ec04e0b1d07407',
  '668e815328b8aa3864229e3f',
  '6674cc4b7edefa00b9cc26dd',
  '66809943bb5ba2571f7ffb08',
  '671764b11752c40df449bd84',
  '671b52cf0b7ec330e33fb505',
  '67486cb1146c2478a2f7ad73',
  '671b53080b7ec330e33fb5f2',
  '66829eb3e99855a300c44ce5',
  '66eab2721f5c91085044b3c9',
  '66bc5a61d0d48411ef2f5ca5',
  '66bc2fe5d0d48411ef2f5691',
  '672326b7587cf240c359eca2',
  '67231f75587cf240c359ea2e',
  '66bb09113f5b086356e0c31c',
  '66dad8255c1e4fe19d5cbd79',
  '66f3febdd6c9c8012e018452',
  '672f6c4da581a7b68fc6c1ef',
  '674765a4003b44a883df2352',
  '6750528b3a577803a8b980fd',
  '67530a518156d767f064887a',
  '67530ad98156d767f06488a0',
  '675fe40f89896c96bcef1217',
  '6761352fa0f94ca7a2889a24'
]

// Delete non active users for good
const getNonActiveUsers = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger(`Getting non active users ...`)
  const nonActiveUsers =
    (await sourceDB
      ?.collection('users')
      .find({ status: { $ne: 'Approved' } })
      .sort({ createdAt: 1 })
      .toArray()) ?? []
  logger(`Found ${nonActiveUsers.length} non active users`)
  logger(nonActiveUsers)
  return nonActiveUsers as OldUser[]
}

const getTestUsers = async (
  sourceDB: Db,
  logger: (message: string) => void
) => {
  logger(`Getting test users ...`)
  const testUsers =
    (await sourceDB
      ?.collection('users')
      .find({ _id: { $in: testingUsers.map((id) => new ObjectId(id)) } })
      .toArray()) ?? []
  logger(`Found ${testUsers.length} test users`)
  return testUsers as OldUser[]
}

const getUsersWithSameEmail = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const result: Record<string, string[]> = {}
  const usersByEmail: Record<string, OldUser[]> = {}
  logger(`Check for users with the same emails ...`)
  const allEntities = ((await sourceDB
    .collection('users')
    .find({})
    .toArray()) ?? []) as OldUser[]
  for (const entity of allEntities) {
    const otherEntities = ((await sourceDB
      .collection('users')
      .find({ email: entity.email })
      .toArray()) ?? []) as OldUser[]
    if (otherEntities.length > 1) {
      result[entity.email] = Array.from(
        new Set(otherEntities.map((user) => user._id.toString()))
      )
    }
  }
  for (const email in result) {
    const users = ((await sourceDB
      .collection('users')
      .find({ email })
      .toArray()) ?? []) as OldUser[]
    usersByEmail[email] = users
  }
  logger(`Found ${Object.keys(usersByEmail).length} users with same emails`)
  logger(usersByEmail)
  return usersByEmail
}

const getUsersHavingInvalidCompanyUser = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const allUsers = ((await sourceDB?.collection('users').find({}).toArray()) ??
    []) as OldUser[]
  const allCompanyUserIds = allUsers
    .filter((user) => user.type === 'Company')
    .map((user) => user._id.toString())
  return allUsers.filter(
    (user) =>
      ['Broker', 'Employee'].includes(user.type) &&
      !!user.company &&
      !allCompanyUserIds.includes(user.company.toString())
  )
}

const deleteAssociatedEntitiesWithUser = async (
  sourceDB: Db,
  user: OldUser,
  logger: (message: any) => void
) => {
  logger(`Deleting associated entities with user ...`)
  await deleteEntity(
    sourceDB,
    'comments',
    'comment',
    { user: user._id },
    logger
  )
  await deleteEntity(sourceDB, 'likes', 'like', { user: user._id }, logger)
  await deleteEntity(sourceDB, 'leads', 'lead', { client: user._id }, logger)
  await deleteEntity(
    sourceDB,
    'follows',
    'follower follow',
    { follower: user._id },
    logger
  )
  await deleteEntity(
    sourceDB,
    'follows',
    'following follow',
    { following: user._id },
    logger
  )
  await deleteEntity(
    sourceDB,
    'messages',
    'sender message',
    { sender: user._id },
    logger
  )
  await deleteEntity(
    sourceDB,
    'messages',
    'receiver message',
    { receiver: user._id },
    logger
  )
  await deleteEntity(sourceDB, 'posts', 'post', { user: user._id }, logger)
  await deleteEntity(
    sourceDB,
    'properties',
    'property',
    { owner: user._id },
    logger
  )
  await deleteEntity(sourceDB, 'saves', 'save', { user: user._id }, logger)
  await deleteEntity(
    sourceDB,
    'interactions',
    'interaction',
    { user: user._id },
    logger
  )
  // For company owners
  if (user?.type === 'Company') {
    logger(`Deleting employees of company owner ...`)
    const employees = ((await sourceDB
      ?.collection('users')
      .find({ company: user._id })
      .toArray()) ?? []) as OldUser[]
    await deleteUsers(sourceDB, employees, logger)
    logger(`Deleted ${employees.length} employees of company owner`)
  }
}

const deleteUsers = async (
  sourceDB: Db,
  users: OldUser[],
  logger: (message: any) => void
) => {
  const uniqueUsers = getUniqueEntities<OldUser>(users)
  logger(`Deleting ${uniqueUsers.length} users ...`)
  for (const user of uniqueUsers) {
    await sourceDB?.collection('users').deleteOne({ _id: user._id })
    logger('Deleted user:')
    logger({
      email: user.email,
      name: user.name,
      type: user.type,
      id: user._id.toString()
    })
    await deleteAssociatedEntitiesWithUser(sourceDB, user, logger)
  }
  logger(
    `Deleted ${users.length} non active, test, deleted users and users with invalid company users`
  )
}

const mergeAssociatedEntitiesWithUser = async (
  sourceDB: Db,
  users: OldUser[],
  logger: (message: any) => void
) => {
  logger(`Merging users ...`)
  if (users.length < 2) {
    logger(`Not enough users to merge`)
    return
  }
  const [responsibleUser, ...usersToMerge] = users
  const responsibleUserId = responsibleUser?._id
  logger(
    `The id for the user to be responsible for the merge is ${responsibleUserId}`
  )
  const usersToMergeIds = usersToMerge.map((user) => user._id)
  logger(`The ids for the users to be merged are ${usersToMergeIds.join(', ')}`)
  await mergeEntity(
    sourceDB,
    'comments ',
    { user: { $in: usersToMergeIds } },
    { user: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'likes',
    { user: { $in: usersToMergeIds } },
    { user: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'leads',
    { client: { $in: usersToMergeIds } },
    { client: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'follows',
    { follower: { $in: usersToMergeIds } },
    { follower: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'follows',
    { following: { $in: usersToMergeIds } },
    { following: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'messages',
    { sender: { $in: usersToMergeIds } },
    { sender: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'messages',
    { receiver: { $in: usersToMergeIds } },
    { receiver: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'posts',
    { user: { $in: usersToMergeIds } },
    { user: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'properties',
    { owner: { $in: usersToMergeIds } },
    { owner: responsibleUserId },
    logger
  )
  await mergeEntity(
    sourceDB,
    'saves',
    { user: { $in: usersToMergeIds } },
    { user: responsibleUserId },
    logger
  )
  logger(`Deleting users after the merge ...`)
  await deleteUsers(sourceDB, usersToMerge, logger)
}

export async function filterUsers(
  sourceDB: Db,
  logger: (message: any) => void
) {
  const nonActiveUsers = await getNonActiveUsers(sourceDB, logger)
  logger('Checking for deleted users ...')
  const deletedUsers = await getDeletedEntities<OldUser>(sourceDB, 'users')
  logger(`Found ${deletedUsers.length} deleted users`)
  logger(deletedUsers)
  logger('Checking for test users ...')
  const testUsers = await getTestUsers(sourceDB, logger)
  logger(`Found ${testUsers.length} test users`)
  logger(testUsers)
  logger(`Check for users having invalid company user ...`)
  const usersHavingInvalidCompanyUser = await getUsersHavingInvalidCompanyUser(
    sourceDB,
    logger
  )
  logger(
    `Found ${usersHavingInvalidCompanyUser.length} users having invalid company user`
  )
  logger(usersHavingInvalidCompanyUser)
  await deleteUsers(
    sourceDB,
    [
      ...nonActiveUsers,
      ...deletedUsers,
      ...testUsers,
      ...usersHavingInvalidCompanyUser
    ],
    logger
  )
  const usersWithSameEmail = await getUsersWithSameEmail(sourceDB, logger)
  logger(
    `============================================== start merging users with same email ===============================================`
  )
  for (const email in usersWithSameEmail) {
    logger(`Merging associated entities with user ${email} ...`)
    await mergeAssociatedEntitiesWithUser(
      sourceDB,
      usersWithSameEmail[email] ?? [],
      logger
    )
    logger(`Merged associated entities with user ${email}`)
  }
  logger(
    `============================================== end merging users with same email ===============================================`
  )
}
