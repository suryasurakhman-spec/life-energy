module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@/domain': './src/domain',
            '@/application': './src/application',
            '@/infrastructure': './src/infrastructure',
            '@/presentation': './src/presentation',
            '@/lib': './src/lib',
            '@/theme': './src/theme',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      ],
      // react-native-reanimated must be last
      'react-native-reanimated/plugin',
    ],
  };
};
