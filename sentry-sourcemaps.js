/**
 * Cross-platform script to handle Sentry sourcemap generation
 */
const { execSync } = require('child_process')

// Get environment variables
const buildHusky = process.env.BUILD_HUSKY
const gcrCi = process.env.GCR_CI

// Replicate the shell script logic
if (buildHusky !== 'true') {
  if (gcrCi !== 'true') {
    console.log('Running sentry:sourcemaps:local...')
    execSync('npm run sentry:sourcemaps:local', { stdio: 'inherit' })
  } else {
    console.log('Running sentry:sourcemaps:ci...')
    execSync('npm run sentry:sourcemaps:ci', { stdio: 'inherit' })
  }
} else {
  console.log('Skipping sourcemap generation due to BUILD_HUSKY=true')
}
