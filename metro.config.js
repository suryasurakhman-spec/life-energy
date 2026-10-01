const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .sql migration files (required for drizzle-orm expo-sqlite migrator)
config.resolver.assetExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
