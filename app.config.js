// Settings that come from .env rather than app.json.
//
// Native Google sign-in on iOS needs the reversed iOS client ID as a URL scheme. Its config
// plugin throws without one (and without options it expects Firebase files), so it is added
// only once EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set. Android needs no plugin for it.
module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!iosClientId) return config;
  const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`;
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ['@react-native-google-signin/google-signin', { iosUrlScheme }]],
  };
};
