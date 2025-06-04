const tsConfigPaths = require('tsconfig-paths')
const path = require('path')
const fs = require('fs')

const baseDir = '/usr/src/app/dist'

// Function to discover directories in a given path
function discoverDirectories(directoryPath) {
  try {
    return fs
      .readdirSync(directoryPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    console.warn(
      `Warning: Could not read directory ${directoryPath}`,
      error.message
    )
    return []
  }
}

// Discover src subdirectories for path aliases
const srcPath = path.resolve(baseDir, 'src')
const srcSubdirs = discoverDirectories(srcPath)

// Build paths object dynamically
const paths = {
  // Special case for @commonTypes
  '@commonTypes': [path.resolve(baseDir, 'types')]
}

// Dynamically add all discovered src subdirectories
srcSubdirs.forEach((dir) => {
  // Convert directory names to camelCase for potential path aliases
  let aliasName = dir.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

  // Handle special cases
  if (dir === 'schemas') {
    paths['@schema'] = [path.resolve(srcPath, dir)]
  } else {
    // For normal directories
    paths[`@${aliasName}`] = [path.resolve(srcPath, dir)]
  }
})

// Add scripts path if it exists
const scriptsPath = path.resolve(baseDir, 'scripts')
if (fs.existsSync(scriptsPath)) {
  paths['@scripts'] = [scriptsPath]
}

// Register the paths
const cleanup = tsConfigPaths.register({
  baseUrl: baseDir,
  paths
})

process.on('exit', cleanup)
