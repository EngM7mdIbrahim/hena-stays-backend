import fs from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'

const deletedDataPath = path.join(
  __dirname,
  `deleted-data-${new Date().toISOString()}.json`
)

const deletedData: Record<string, any[]> = {
  properties: []
}

// Helper to save deleted data to JSON file
async function saveDeletedData() {
  await fs.writeFile(deletedDataPath, JSON.stringify(deletedData, null, 2))
  console.log('Deleted data saved to JSON file.')
}

async function deleteInvalidProperties(db: mongoose.mongo.Db) {
  const propertiesCollection = db.collection('properties')
  const companiesCollection = db.collection('users')
  const brokersCollection = db.collection('brokers')

  const properties = await propertiesCollection.find().toArray()
  console.log(`Found ${properties.length} properties to process`)

  for (const property of properties) {
    if (!property.createdBy) {
      console.log(`Deleting property ${property._id} - No creator specified`)
      deletedData?.properties?.push(property)
      await propertiesCollection.deleteOne({ _id: property._id })
      continue
    }

    const company = await companiesCollection.findOne({
      _id: property.createdBy
    })
    const broker = await brokersCollection.findOne({ _id: property.createdBy })
    const creator = company || broker
    if (!creator) {
      console.log(`Deleting property ${property._id} - Creator not found`)
      deletedData.properties?.push(property)
      await propertiesCollection.deleteOne({ _id: property._id })
      continue
    }
    console.log(`It's a valid property ${property._id} - Creator found`)
  }
}

export async function propertiesFilterRunner(): Promise<Record<string, any[]>> {
  const uri = process.env.MONGO_DB_URL ?? ''
  const connection = mongoose.createConnection(uri)

  try {
    await connection.asPromise()
    const db = connection.db
    if (!db) {
      throw new Error('Database connection is not available.')
    }

    await deleteInvalidProperties(db)
    await saveDeletedData()

    return deletedData
  } catch (error) {
    console.error('Error during properties filtering:', error)
    throw error
  } finally {
    await connection.close()
  }
}
