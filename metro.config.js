const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Bundle .sql migration files as source so babel-plugin-inline-import can inline them
// (required for the drizzle-orm expo-sqlite migrator).
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
