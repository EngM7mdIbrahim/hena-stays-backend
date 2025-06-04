import { Db } from 'mongodb'
import { OldInteractions } from 'scripts/interfaces-v1'

import { deleteEntity } from './common/delete-entity'
import { getDeletedEntities } from './common/get-deleted-entities'
import { getUniqueEntities } from './common/get-unique-entities'

const getInteractionsWithNoUser = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const interactionsWithNoUser: OldInteractions[] = []
  const interactions = ((await sourceDB
    .collection('interactions')
    .find({})
    .toArray()) ?? []) as OldInteractions[]
  for (const interaction of interactions) {
    const user = await sourceDB
      .collection('users')
      .findOne({ _id: interaction.user })
    if (!user) {
      logger(`Interaction with no user: ${interaction._id}`)
      interactionsWithNoUser.push(interaction)
    }
    continue
  }
  return interactionsWithNoUser
}

const getInteractionsWithNoProperty = async (
  sourceDB: Db,
  logger: (message: any) => void
) => {
  const interactionsWithNoProperty: OldInteractions[] = []
  const interactions = ((await sourceDB
    .collection('interactions')
    .find({})
    .toArray()) ?? []) as OldInteractions[]
  for (const interaction of interactions) {
    const property = await sourceDB
      .collection('properties')
      .findOne({ _id: interaction.property })
    if (!property) {
      interactionsWithNoProperty.push(interaction)
    }
  }
  return interactionsWithNoProperty
}
const getFakeInteractions = async (sourceDB: Db) => {
  return ((await sourceDB
    .collection('interactions')
    .find({
      fake: true
    })
    .toArray()) ?? []) as OldInteractions[]
}

export async function filterInteractions(
  sourceDB: Db,
  logger: (message: any) => void
) {
  logger('Checking for deleted interactions...')
  const deletedInteractions = await getDeletedEntities<OldInteractions>(
    sourceDB,
    'interactions'
  )
  logger(`Found ${deletedInteractions.length} deleted interactions:`)
  logger(deletedInteractions)
  logger('Checking for interactions with no user...')
  const interactionsWithNoUser = await getInteractionsWithNoUser(
    sourceDB,
    logger
  )
  logger(`Found ${interactionsWithNoUser.length} interactions with no user:`)
  logger(interactionsWithNoUser)
  logger('Checking for interactions with no property...')
  const interactionsWithNoProperty = await getInteractionsWithNoProperty(
    sourceDB,
    logger
  )
  logger(
    `Found ${interactionsWithNoProperty.length} interactions with no property:`
  )
  logger(interactionsWithNoProperty)
  logger('Checking for fake interactions...')
  const fakeInteractions = await getFakeInteractions(sourceDB)
  logger(`Found ${fakeInteractions.length} fake interactions:`)
  logger(fakeInteractions)
  const uniqueInteractions = getUniqueEntities<OldInteractions>([
    ...deletedInteractions,
    ...interactionsWithNoUser,
    ...interactionsWithNoProperty,
    ...fakeInteractions
  ])
  if (uniqueInteractions.length > 0) {
    logger('Deleting interactions with no user...')
    for (const interaction of uniqueInteractions) {
      await deleteEntity(
        sourceDB,
        'interactions',
        'interaction',
        { _id: interaction._id },
        logger
      )
    }
  } else {
    logger('No interactions with no user found, skipping filtering ...')
  }
}
