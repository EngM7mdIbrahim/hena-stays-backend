import type { UserRoleType, UserStatusType } from '@commonTypes'
import type { CreateUserDto } from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldUser } from 'scripts/interfaces-v1'

// Constants and interfaces for the
const UserRole = {
  Broker: 'Broker',
  Company: 'Company',
  Admin: 'Admin',
  CompanyAdmin: 'CompanyAdmin',
  Agent: 'Agent',
  User: 'User',
  Employee: 'Employee',
  AdminViewer: 'AdminViewer'
}
const UserType = {
  Company: 'Company',
  User: 'User',
  Owner: 'Owner',
  Broker: 'Broker',
  SpecialBroker: 'Special Broker',
  Admin: 'Admin',
  Employee: 'Employee',
  AdminViewer: 'Admin Viewer',
  CompanyAdmin: 'Company Admin'
}
const MappingToOurTypes = {
  [UserType.User]: UserRole.User,
  [UserType.Broker]: UserRole.Broker,
  [UserType.Admin]: UserRole.Admin,
  [UserType.Employee]: UserRole.CompanyAdmin,
  [UserType.AdminViewer]: UserRole.AdminViewer,
  [UserType.CompanyAdmin]: UserRole.CompanyAdmin,
  [UserType.Company]: UserRole.Company
}
const MappingBrokerToOurCorporateRoles = {
  [UserType.Broker]: UserRole.Agent,
  [UserType.Employee]: UserRole.CompanyAdmin
}

const oldStatus = {
  Approved: 'Approved',
  Pending: 'Pending',
  Blocked: 'Blocked'
}
const newStatus = {
  [oldStatus.Approved]: 'Active',
  [oldStatus.Pending]: 'Pending',
  [oldStatus.Blocked]: 'Blocked'
}
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

let insertedUserCounts = 0

// Analysis function
const analyzeSuspectedUsers = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  // Write the usernames here and check them with the data after the computational analysis
  const usernames = ['']
  const users = await sourceDB
    ?.collection('users')
    .find({ username: { $in: usernames } })
    .toArray()
  logger(`Found ${users?.length} users with usernames: ${usernames.join(', ')}`)
  let validUserIds: {
    username: string
    email: string
    name: string
    type: string
    id: string
    rejectReason: string[]
  }[] = []
  let invalidUserIds: {
    username: string
    email: string
    name: string
    type: string
    id: string
    rejectReason: string[]
  }[] = []
  for (const user of users) {
    let isValid = true
    let rejectReason: string[] = []
    logger(`Checking user ${user._id.toString()}`)
    const companyUsers =
      (await sourceDB
        ?.collection('users')
        .find({ company: user._id })
        .toArray()) ?? []
    if (companyUsers.length > 0) {
      isValid = false
      rejectReason.push('User is a company owner')
    }
    const comments =
      (await sourceDB
        ?.collection('comments')
        .find({ user: user._id })
        .toArray()) ?? []
    if (comments.length > 0) {
      isValid = false
      rejectReason.push('User has comments')
    }
    let follows =
      (await sourceDB
        ?.collection('follows')
        .find({ following: user._id })
        .toArray()) ?? []
    if (follows.length > 0) {
      isValid = false
      rejectReason.push('User has follows to other users')
    }
    follows =
      (await sourceDB
        ?.collection('follows')
        .find({ follower: user._id })
        .toArray()) ?? []
    if (follows.length > 0) {
      isValid = false
      rejectReason.push('User has followers')
    }
    const likes =
      (await sourceDB
        ?.collection('likes')
        .find({ user: user._id })
        .toArray()) ?? []
    if (likes.length > 0) {
      isValid = false
      rejectReason.push('User has likes')
    }
    const leads =
      (await sourceDB
        ?.collection('leads')
        .find({ client: user._id })
        .toArray()) ?? []
    if (leads.length > 0) {
      isValid = false
      rejectReason.push('User has leads')
    }
    let messages =
      (await sourceDB
        ?.collection('messages')
        .find({ sender: user._id })
        .toArray()) ?? []
    if (messages.length > 0) {
      isValid = false
      rejectReason.push('User sending has messages')
    }
    messages =
      (await sourceDB
        ?.collection('messages')
        .find({ receiver: user._id })
        .toArray()) ?? []
    if (messages.length > 0) {
      isValid = false
      rejectReason.push('User receiving has messages')
    }
    const posts =
      (await sourceDB
        ?.collection('posts')
        .find({ user: user._id })
        .toArray()) ?? []
    if (posts.length > 0) {
      isValid = false
      rejectReason.push('User has posts')
    }
    const properties =
      (await sourceDB
        ?.collection('properties')
        .find({ owner: user._id })
        .toArray()) ?? []
    if (properties.length > 0) {
      isValid = false
      rejectReason.push('User has properties')
    }
    const saves =
      (await sourceDB
        ?.collection('saves')
        .find({ user: user._id })
        .toArray()) ?? []
    if (saves.length > 0) {
      isValid = false
      rejectReason.push('User has saves')
    }
    if (isValid) {
      validUserIds.push({
        username: user.username,
        email: user.email,
        name: user.name,
        type: user.type,
        id: user._id.toString(),
        rejectReason: rejectReason
      })
    } else {
      invalidUserIds.push({
        username: user.username,
        email: user.email,
        name: user.name,
        type: user.type,
        id: user._id.toString(),
        rejectReason: rejectReason
      })
    }
  }
  logger(
    `There are ${validUserIds.length} valid users and ${invalidUserIds.length} invalid users`
  )
  logger(`Invalid users`)
  logger(invalidUserIds)
  logger(`Valid users`)
  logger(validUserIds)
}

export const usersMigrations = async (
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) => {
  const passedUsers: OldUser[] = []
  try {
    const sourceUsers =
      (await sourceDB
        ?.collection('users')
        .find()
        .sort({ createdAt: 1 })
        .toArray()) ?? []
    const targetUserModel = targetDB?.collection('users')
    for (let index = 0; index < sourceUsers.length; index++) {
      const user = sourceUsers[index]
      const userWithType: OldUser = user as unknown as OldUser
      let role = MappingToOurTypes[userWithType.type] as string
      let company = null
      let broker = null
      if (userWithType.companyInfo) {
        logger(`Inserting company info for user: ${userWithType.email}`)
        const companyData = await sourceDB
          ?.collection('companyinfos')
          .findOne({ _id: userWithType.companyInfo })
        const createCompany = (await targetDB
          ?.collection('companies')
          .insertOne({
            owner: userWithType._id,
            name: userWithType.name,
            authority: companyData?.authority,
            city: companyData?.city,
            jurisdiction: companyData?.jurisdiction,
            address: companyData?.address,
            licenseCopies: companyData?.licenseCopies,
            license: userWithType.license,
            licenseExpiryDate: companyData?.licenseExpiryDate,
            watermark: userWithType?.watermark
          })) as any
        userWithType.name = companyData?.responsibleName
        company = createCompany?.insertedId ?? null
      } else if (userWithType.company) {
        role = MappingBrokerToOurCorporateRoles[userWithType.type] as string
        const checkCompany = await targetDB
          ?.collection('companies')
          .findOne({ owner: userWithType.company })
        if (!checkCompany) {
          logger(`Company not found, skipping ${userWithType._id}`)
          passedUsers.push(userWithType)
          continue
        }
        company = checkCompany?._id
      } else if (userWithType.brokerInfo) {
        const oldBroker = await sourceDB
          ?.collection('brokerinfos')
          .findOne({ _id: userWithType.brokerInfo })
        logger(`Inserting broker info for user: ${userWithType.email}`)
        const createBroker = await targetDB?.collection('brokers').insertOne({
          city: oldBroker?.city,
          licenseCopies: oldBroker?.licenseCopies,
          license: userWithType.license,
          licenseExpiryDate: oldBroker?.licenseExpiryDate,
          watermark: userWithType?.watermark
        })
        broker = createBroker?.insertedId ?? null
      }
      const newUser: Omit<CreateUserDto, 'subscription'> & {
        _id: Types.ObjectId
        otp: string
        otpExpires: Date | null
        stripeCustomerId: string
        subscription: Types.ObjectId
        socketId: string | null
        fcmToken: string | null
        createdAt: Date
        updatedAt: Date
        deletedAt: Date | null
      } = {
        role: role as UserRoleType,
        company: company,
        broker: broker as any,
        _id: new Types.ObjectId(userWithType._id.toString()),
        password: userWithType.password,
        otp: userWithType.otp,
        otpExpires: userWithType.otpExpire
          ? new Date(userWithType.otpExpire)
          : null,
        stripeCustomerId: userWithType.stripeCustomerId,
        socketId: null,
        fcmToken: null,
        name: userWithType.name,
        email: userWithType.email,
        username: userWithType.username,
        phone: userWithType.phone,
        whatsapp: userWithType.whatsapp,
        image: userWithType.image,
        watermark: userWithType.watermark,
        status: newStatus[userWithType.status] as UserStatusType,
        subscription: new Types.ObjectId(userWithType.subscription.toString()),
        createdAt: new Date(userWithType.createdAt),
        updatedAt: new Date(),
        deletedAt: userWithType.deleted ? new Date() : null,
        chatMeta: {
          online: false,
          typing: false
        }
      }
      logger(`Inserting user: ${newUser.email}`)
      await targetUserModel?.insertOne(newUser as unknown as any)
      insertedUserCounts++
    }
    logger(`There are ${insertedUserCounts} users inserted`)
    logger(
      `There are ${passedUsers.length} users without company ${JSON.stringify(
        passedUsers.map((user) => {
          return {
            email: user.email,
            name: user.name,
            type: user.type,
            id: user._id
          }
        }),
        null,
        2
      )}`
    )
  } catch (err) {
    logger(`Error: ${err}`)
  }
}
