import mongoose from 'mongoose'

import { env } from './env'

// Function to copy a collection
async function copyCollection(
  sourceConn: mongoose.mongo.Db,
  targetConn: mongoose.mongo.Db,
  collectionName: string
): Promise<void> {
  const sourceCollection = sourceConn.collection(collectionName)
  const targetCollection = targetConn.collection(collectionName)

  // Clear the target collection if you want to replace it completely
  // Enable this if you want to cut instead of copy
  // await targetCollection.deleteMany({});

  const documents = await sourceCollection.find().toArray()
  if (documents.length > 0) {
    await targetCollection.insertMany(documents)
  }
}

async function clearCollection(
  db: mongoose.mongo.Db,
  collectionName: string
): Promise<void> {
  const collection = db.collection(collectionName)
  await collection.deleteMany({})
}

async function clearDatabase(db: mongoose.mongo.Db): Promise<void> {
  const collections = await db.listCollections().toArray()
  for (const collection of collections) {
    console.log(`Clearing collection ${collection.name}`)
    await clearCollection(db, collection.name)
  }
}

async function main(): Promise<void> {
  // Source MongoDB details
  const sourceUri: string | undefined = env.MONGO_DB_SRC
  if (!sourceUri) {
    throw new Error('Source MongoDB URI (MONGO_DB_SRC) is not defined.')
  }

  const sourceConnection = mongoose.createConnection(sourceUri)

  // Target MongoDB details
  const targetUri: string | undefined = env.MONGO_DB_TGT
  if (!targetUri) {
    throw new Error('Target MongoDB URI (MONGO_DB_TGT) is not defined.')
  }

  const targetConnection = mongoose.createConnection(targetUri)

  try {
    // Wait for connections to be established
    await sourceConnection.asPromise()
    await targetConnection.asPromise()

    const sourceDb = sourceConnection.db
    const targetDb = targetConnection.db
    if (!sourceDb || !targetDb) {
      throw new Error('Database connection is not available.')
    }
    const collections = await sourceDb?.listCollections().toArray()

    // Clear Target Database
    console.log('Clearing target database...')
    await clearDatabase(targetDb!)

    // Copy collections
    console.log('Copying collections...')
    for (const collection of collections!) {
      console.log(`Copying collection: ${collection.name}`)
      await copyCollection(sourceDb, targetDb, collection.name)
    }

    console.log('Data transfer complete.')
  } catch (error) {
    console.error('Error during data transfer:', error)
  } finally {
    await sourceConnection.close()
    await targetConnection.close()
  }
}

main().catch(console.error)
