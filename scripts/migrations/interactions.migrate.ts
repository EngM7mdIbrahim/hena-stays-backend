import type {
  CreateInteractionsDto,
  CreatePropertySaveDto,
  CreateUserViewPropertiesDto
} from '@contracts'
import { Db } from 'mongodb'
import { Types } from 'mongoose'
import { OldInteractions } from 'scripts/interfaces-v1'

export async function interactionsMigrations(
  sourceDB: Db,
  targetDB: Db,
  logger: (message: any) => void
) {
  const sourceInteractionModel = sourceDB?.collection('interactions')
  const targetInteractionModel = targetDB?.collection('interactions')
  const targetUserViewPropertiesModel =
    targetDB?.collection('userviewproperties')
  const targetPropertySavesModel = targetDB?.collection('propertysaves')
  const usersModel = targetDB?.collection('users')
  const propertiesModel = targetDB?.collection('properties')
  const sourceInteractions = await sourceInteractionModel
    ?.find()
    .sort({})
    .toArray()
  logger(`Total interactions to process: ${sourceInteractions.length}`)
  for (let index = 0; index < sourceInteractions.length; index++) {
    const sourceInteraction = sourceInteractions[index]
    const interactionWithType: OldInteractions =
      sourceInteraction as unknown as OldInteractions
    if (interactionWithType.fake) {
      logger(`Skipping fake interaction: ${interactionWithType._id}`)
      continue
    }
    logger(`Processing interaction: ${interactionWithType._id}`)
    logger(`Processing interaction with type: ${interactionWithType.type}`)
    const user = await usersModel?.findOne({
      _id: interactionWithType.user
    })
    if (!user) {
      logger(`Skipping interaction ${interactionWithType._id} - User not found`)
      continue
    }

    const property = await propertiesModel?.findOne({
      _id: interactionWithType.property
    })
    if (!property) {
      logger(
        `Skipping interaction ${interactionWithType._id} - Property not found`
      )
      continue
    }
    logger(
      `Processing interaction with property: ${property._id} and type ${interactionWithType.type}`
    )
    if (interactionWithType.type === 'Views') {
      const checkIfViewExists = await targetUserViewPropertiesModel?.findOne({
        user: interactionWithType.user,
        property: interactionWithType.property
      })
      if (!checkIfViewExists) {
        const newUserView: Omit<
          CreateUserViewPropertiesDto,
          'user' | 'property'
        > & {
          user: Types.ObjectId
          property: Types.ObjectId
          _id: Types.ObjectId
          createdAt: Date
          updatedAt: Date
          deletedAt: Date | null
        } = {
          _id: interactionWithType._id,
          user: interactionWithType.user,
          property: interactionWithType.property,
          views: 1,
          createdAt: interactionWithType.createdAt,
          updatedAt: interactionWithType.updatedAt,
          deletedAt: interactionWithType.deleted ? new Date() : null
        }
        await targetUserViewPropertiesModel?.insertOne(newUserView)
        logger(`Created new user view properties: ${newUserView._id}`)
        const interaction = await targetInteractionModel?.findOne({
          property: interactionWithType.property
        })
        if (!interaction) {
          const newInteraction: Omit<CreateInteractionsDto, 'property'> & {
            property: Types.ObjectId
            _id: Types.ObjectId
            createdAt: Date
            updatedAt: Date
            deletedAt: Date | null
          } = {
            _id: interactionWithType._id,
            property: interactionWithType.property,
            views: 1,
            createdAt: interactionWithType.createdAt,
            updatedAt: interactionWithType.updatedAt,
            impressions: 1,
            visitors: 1,
            saves: 0,
            leadClicks: {
              phone: 0,
              whatsapp: 0,
              email: 0,
              chat: 0
            },
            deletedAt: interactionWithType.deleted ? new Date() : null
          }
          await targetInteractionModel?.insertOne(newInteraction)
          logger(`Created new interaction: ${newInteraction._id}`)
          continue
        }
        await targetInteractionModel?.updateOne(
          { property: interactionWithType.property },
          { $inc: { views: 1, visitors: 1, impressions: 1 } }
        )
        logger(`Interaction updated ${interactionWithType._id}`)
        continue
      } else {
        await targetUserViewPropertiesModel?.updateOne(
          {
            user: interactionWithType.user,
            property: interactionWithType.property
          },
          { $inc: { views: 1 } }
        )
        logger(`User view properties updated ${interactionWithType._id}`)
        await targetInteractionModel?.updateOne(
          { property: interactionWithType.property },
          { $inc: { views: 1, impressions: 1 } }
        )
        logger(`Interaction updated ${interactionWithType._id}`)
        continue
      }
    }
    if (interactionWithType.type === 'Saves') {
      const newPropertySave: Omit<
        CreatePropertySaveDto,
        'user' | 'property'
      > & {
        user: Types.ObjectId
        property: Types.ObjectId
        _id: Types.ObjectId
        createdAt: Date
        updatedAt: Date
        deletedAt: Date | null
      } = {
        _id: interactionWithType._id,
        user: interactionWithType.user,
        property: interactionWithType.property,
        createdAt: interactionWithType.createdAt,
        updatedAt: interactionWithType.updatedAt,
        deletedAt: interactionWithType.deleted ? new Date() : null
      }
      await targetPropertySavesModel?.insertOne(newPropertySave)
      logger(`Created new property save: ${newPropertySave._id}`)
      const interaction = await targetInteractionModel?.findOne({
        property: interactionWithType.property
      })

      if (!interaction) {
        const newInteraction: Omit<CreateInteractionsDto, 'property'> & {
          property: Types.ObjectId
          createdAt: Date
          updatedAt: Date
        } = {
          impressions: 0,
          leadClicks: {
            chat: 0,
            email: 0,
            phone: 0,
            whatsapp: 0
          },
          property: interactionWithType.property,
          saves: 1,
          views: 0,
          visitors: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await targetInteractionModel?.insertOne(newInteraction)
        logger(
          `Created new interaction for property: ${newInteraction.property}`
        )
        continue
      }
      await targetInteractionModel?.updateOne(
        { property: interactionWithType.property },
        { $inc: { saves: 1 } }
      )
      logger(`Interaction updated ${interactionWithType._id}`)
      continue
    }
    if (interactionWithType.type === 'Search') {
      const interaction = await targetInteractionModel?.findOne({
        property: interactionWithType.property
      })
      if (!interaction) {
        const newInteraction: Omit<CreateInteractionsDto, 'property'> & {
          property: Types.ObjectId
          createdAt: Date
          updatedAt: Date
        } = {
          impressions: 1,
          leadClicks: {
            chat: 0,
            email: 0,
            phone: 0,
            whatsapp: 0
          },
          property: interactionWithType.property,
          saves: 0,
          views: 0,
          visitors: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await targetInteractionModel?.insertOne(newInteraction)
        logger(
          `Created new interaction for property: ${newInteraction.property}`
        )
        continue
      } else {
        await targetInteractionModel?.updateOne(
          { property: interactionWithType.property },
          { $inc: { impressions: 1 } }
        )
        logger(`Interaction updated ${interactionWithType._id}`)
        continue
      }
    }
  }
}
