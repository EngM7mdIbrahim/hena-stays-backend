import { MediaType } from '@commonTypes'
import type { CreateCreditsRequestDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'

import { OldCreditRequest } from '../interfaces-v1'

export const migrateCreditRequests = async (sourceDB: Db, targetDB: Db) => {
  const sourceCreditRequests = ((await sourceDB
    .collection('creditrequests')
    .find({})
    .toArray()) ?? []) as OldCreditRequest[]
  const targetCreditRequestsModel = targetDB.collection('creditrequests')
  for (const creditRequest of sourceCreditRequests) {
    const targetCreditRequest: Omit<CreateCreditsRequestDto, 'user'> & {
      _id: Types.ObjectId
      user: Types.ObjectId
      taxes: number
      total: number
      createdAt: Date
      updatedAt: Date
    } = {
      _id: new Types.ObjectId(creditRequest._id),
      createdAt: creditRequest.createdAt,
      updatedAt: creditRequest.updatedAt,
      user: new Types.ObjectId(creditRequest.user),
      status: creditRequest.status,
      credits: creditRequest.credits,
      fees: creditRequest.fees,
      taxes: creditRequest.taxes,
      total: creditRequest.total,
      media: {
        type: creditRequest.media.fileType as MediaType,
        url: creditRequest.media.url
      }
    }
    await targetCreditRequestsModel.insertOne(targetCreditRequest)
  }
}
