import { Db } from 'mongodb'
import { OldCreditRequest } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getCreditRequestsWithNoUser = async (sourceDB: Db) => {
  const creditRequestsWithNoUser: OldCreditRequest[] = []
  const creditRequests = ((await sourceDB
    .collection('creditrequests')
    .find({})
    .toArray()) ?? []) as OldCreditRequest[]
  for (const creditRequest of creditRequests) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: creditRequest.user })
    if (!user) {
      creditRequestsWithNoUser.push(creditRequest)
    }
  }
  return creditRequestsWithNoUser
}

const getRejectedCreditRequests = async (sourceDB: Db) => {
  const rejectedCreditRequests = ((await sourceDB
    .collection('creditrequests')
    .find({ status: 'rejected' })
    .toArray()) ?? []) as OldCreditRequest[]
  return rejectedCreditRequests
}

export const filterCreditRequests = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  logger('Checking for credit requests with no user...')
  const creditRequestsWithNoUser = await getCreditRequestsWithNoUser(sourceDB)
  logger(
    `Found ${creditRequestsWithNoUser.length} credit requests with no user:`
  )
  logger(creditRequestsWithNoUser)
  logger('Checking for deleted credit requests...')
  const deletedCreditRequests = await getDeletedEntities<OldCreditRequest>(
    sourceDB,
    'creditrequests'
  )
  logger(
    `Found ${deletedCreditRequests.length} deleted credit requests in the database:`
  )
  logger(deletedCreditRequests)
  logger('Checking for rejected credit requests...')
  const rejectedCreditRequests = await getRejectedCreditRequests(sourceDB)
  logger(
    `Found ${rejectedCreditRequests.length} rejected credit requests in the database:`
  )
  logger(rejectedCreditRequests)

  const uniqueCreditRequests = getUniqueEntities<OldCreditRequest>([
    ...creditRequestsWithNoUser,
    ...deletedCreditRequests,
    ...rejectedCreditRequests
  ])
  logger('Deleting credit requests with no user...')
  for (const creditRequest of uniqueCreditRequests) {
    await deleteEntity(
      sourceDB,
      'creditrequests',
      'creditrequest',
      {
        _id: creditRequest._id
      },
      logger
    )
  }
}
