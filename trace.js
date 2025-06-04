/* eslint-disable */
'use strict'
const process = require('process')
require('dotenv').config({ path: '.env.local' })
const opentelemetry = require('@opentelemetry/sdk-node')
const {
  getNodeAutoInstrumentations
} = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { Resource } = require('@opentelemetry/resources')
const {
  MongoDBInstrumentation
} = require('@opentelemetry/instrumentation-mongodb')

const {
  SemanticResourceAttributes
} = require('@opentelemetry/semantic-conventions')

if (
  !process.env.SIGNOZ_API ||
  !process.env.COUNTRY_APP ||
  !process.env.APP_ENV
) {
  throw new Error('Missing environment variables')
}

const exporterOptions = {
  url: process.env.SIGNOZ_API
}
const traceExporter = new OTLPTraceExporter(exporterOptions)
const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
    new MongoDBInstrumentation()
  ],
  resource: new Resource({
    // highlight-next-line
    [SemanticResourceAttributes.SERVICE_NAME]: `truedar-api-${process.env.COUNTRY_APP}-${process.env.APP_ENV}`
  })
})

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0))
})
