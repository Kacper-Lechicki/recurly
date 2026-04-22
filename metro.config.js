const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// pnpm + Metro: resolve deps from this app’s node_modules (see .npmrc node-linker=hoisted).
config.watchFolders = [
  ...new Set([...(config.watchFolders ?? []), projectRoot]),
];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = withNativewind(config);
