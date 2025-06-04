import fs from 'fs/promises'
import path from 'path'
import moment from 'moment'
import mongoose from 'mongoose'

import { env } from './env'

interface KeyAnalysis {
  name: string
  required: boolean
  values: unknown[]
  type: string[] // Array of types
}

interface AnalyticsResult {
  collectionName: string
  numberOfDocs: number
  keys: KeyAnalysis[]
}

async function analyzeCollection(
  collectionName: string
): Promise<AnalyticsResult> {
  const db = mongoose.connection.db
  if (!db) throw new Error('Database connection is not available.')

  const collection = db.collection(collectionName)
  if (!collection)
    throw new Error(`Collection ${collectionName} does not exist.`)

  const documents = await collection.find({}).toArray()
  if (!documents || documents.length === 0) {
    console.warn(`No documents found in collection: ${collectionName}`)
    return {
      collectionName,
      numberOfDocs: 0,
      keys: []
    }
  }

  const keysAnalysis: KeyAnalysis[] = []
  const schemaMap = new Map<
    string,
    { types: Set<string>; values: Set<unknown>; required: boolean }
  >()

  for (const doc of documents) {
    for (const key in doc) {
      const value = doc[key]
      let valueType = typeof value

      // Handle specific cases for `Date` and `Array`
      if (value instanceof Date) {
        valueType = 'Date' as any
      } else if (Array.isArray(value)) {
        valueType = 'array' as any
      }

      if (!schemaMap.has(key)) {
        schemaMap.set(key, {
          types: new Set([valueType]),
          values: new Set(),
          required: true
        })
      }

      const schemaEntry = schemaMap.get(key)!
      schemaEntry.types.add(valueType)
      schemaEntry.values.add(value)
    }

    // Update `required` for keys not present in this document
    schemaMap.forEach((value, key) => {
      if (!(key in doc)) {
        value.required = false
      }
    })
  }

  schemaMap.forEach((value, key) => {
    const valuesArray = Array.from(value.values)
    const containsNull = valuesArray.includes(null)

    // Update required based on the number of values or presence of null
    if (containsNull) {
      value.required = false
    }

    keysAnalysis.push({
      name: key,
      required: value.required,
      values: valuesArray,
      type: Array.from(value.types) // Collect all possible types
    })
  })

  return {
    collectionName,
    numberOfDocs: documents.length,
    keys: keysAnalysis
  }
}

async function runAnalytics() {
  try {
    const collectionName = process.argv[2]
    if (!collectionName) {
      throw new Error(
        'Please provide the collection name as a command-line argument.'
      )
    }

    console.log('Running analytics...')
    await mongoose.connect(env.MONGO_DB_URL)

    console.log(`Analyzing collection: ${collectionName}`)
    const result = await analyzeCollection(collectionName)

    // Write results to JSON file
    const resultsDir = path.join(__dirname, 'results')
    await fs.mkdir(resultsDir, { recursive: true })
    const filePath = path.join(
      resultsDir,
      `${collectionName}-${moment().format('ddd MMM DD YYYY')}-analytics.json`
    )
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf8')
  } catch (error) {
    console.error('Error running analytics:', error)
  } finally {
    await mongoose.disconnect()
  }
}

runAnalytics()
