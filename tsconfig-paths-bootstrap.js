const tsConfigPaths = require('tsconfig-paths')
const path = require('path')
const fs = require('fs')

// Function to strip comments from JSON string
function stripJsonComments(jsonString) {
  return jsonString
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/,\s*}]/g, '}]') // Fix trailing commas in arrays
    .replace(/,\s*}/g, '}') // Fix trailing commas in objects
}

const baseDir = path.resolve(__dirname, '..')

// Read the tsconfig.json file
const tsconfigPath = path.resolve(baseDir, 'tsconfig.json')
const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')
const cleanedContent = stripJsonComments(tsconfigContent)
const tsconfig = JSON.parse(cleanedContent)

const outDir = tsconfig.compilerOptions.outDir || 'dist'
const distBaseUrl = path.resolve(baseDir, outDir, 'apps/backend')
const tsconfigPaths = tsconfig.compilerOptions.paths || {}
const paths = {}
const typesPath = path.resolve(baseDir, outDir, 'types')

Object.keys(tsconfigPaths).forEach((alias) => {
  if (alias === '@commonTypes') {
    paths[alias] = [typesPath]
  } else {
    const targetPaths = tsconfigPaths[alias].map((p) => {
      const cleanPath = p.replace(/\/index$/, '')

      if (cleanPath.startsWith('src/') || cleanPath.startsWith('./src/')) {
        return path.resolve(
          distBaseUrl,
          'src',
          cleanPath.replace(/^(\.\/)?src\//, '')
        )
      } else if (cleanPath.startsWith('./')) {
        return path.resolve(distBaseUrl, 'src', cleanPath.replace(/^\.\//, ''))
      } else {
        return path.resolve(distBaseUrl, 'src', cleanPath)
      }
    })

    paths[alias] = targetPaths
  }
})

const cleanup = tsConfigPaths.register({
  baseUrl: distBaseUrl,
  paths
})

process.on('exit', cleanup)
