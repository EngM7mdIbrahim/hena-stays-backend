import { LeadsContactsTypesEnum, LeadsStatusEnum } from '@commonTypes'
import type { CreateLeadsDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'

const leads: (Omit<CreateLeadsDto, 'user' | 'property'> & {
  _id: Types.ObjectId
  user: Types.ObjectId
  property: Types.ObjectId
  createdAt: Date
  updatedAt: Date
})[] = [
  {
    _id: new Types.ObjectId('67621675dff80a8f185811d3'),
    name: 'Daisuke Goto',
    user: new Types.ObjectId('6762144adff80a8f1858113b'),
    property: new Types.ObjectId('66f3e4a8e5651052d5c3b4db'),
    contactType: LeadsContactsTypesEnum.email,
    status: LeadsStatusEnum.Pending,
    userContactDetails: {
      email: 'daisukegoto66@gmail.com',
      phone: '',
      whatsapp: ''
    },
    createdAt: new Date('2024-12-18T00:25:25.198+00:00'),
    updatedAt: new Date('2024-12-18T00:25:25.198+00:00')
  },
  {
    _id: new Types.ObjectId('67901cacd06eb200d52eace5'),
    name: 'Mamudou Jallow',
    user: new Types.ObjectId('67901c94d06eb200d52eabc3'),
    property: new Types.ObjectId('673c75cf0557c85d893f07aa'),
    status: LeadsStatusEnum.Pending,
    contactType: LeadsContactsTypesEnum.whatsapp,
    userContactDetails: {
      email: 'mamudou5911273@gmail.com',
      phone: '',
      whatsapp: ''
    },
    createdAt: new Date('2025-01-21T22:16:12.985+00:00'),
    updatedAt: new Date('2025-01-21T22:16:12.985+00:00')
  },
  {
    _id: new Types.ObjectId('6792d13e6be1fd5667c45cc7'),
    user: new Types.ObjectId('6792d0c36be1fd5667c457f9'),
    contactType: LeadsContactsTypesEnum.whatsapp,
    status: LeadsStatusEnum.Pending,
    name: 'Charif Mrzak',
    property: new Types.ObjectId('677bb4c6582b7f9e01f0d4ac'),
    userContactDetails: {
      email: 'W8bZw@example.com',
      phone: '',
      whatsapp: ''
    },
    createdAt: new Date('2025-01-23T23:31:10.219+00:00'),
    updatedAt: new Date('2025-01-23T23:31:10.219+00:00')
  }
]

export const leadsMigrations = async (
  targetDB: Db,
  logger: (message: any) => void
) => {
  let insertedLeads: number = 0
  const targetLeadsModel = targetDB?.collection('leads')

  try {
    for (let index = 0; index < leads.length; index++) {
      const lead = leads[index]
      await targetLeadsModel?.insertOne(lead as any)
      insertedLeads++
    }
    logger(`Inserted ${insertedLeads} leads`)
  } catch (error) {
    logger(error)
  }
}
