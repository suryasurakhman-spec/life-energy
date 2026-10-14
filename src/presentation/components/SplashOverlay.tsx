import { useEffect } from 'react';
import { Dimensions, Image, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SplashScreen } from 'expo-router';
import { useTranslation } from '@/lib/i18n';
import { palette } from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { space, splashLogoSize } from '@/theme/layout';

const HOLD_MS = 900;

// Android: the native splash's own drawable, already on the device, so the logo is there on the first frame.
const LOGO = Platform.OS === 'android'
  ? { uri: 'splashscreen_logo' }
  : require('../../../assets/images/splash-icon.png');

/**
 * Drawn over the app as the native splash hides: same logo in the same place, with the
 * name and slogan right under it (Android's own splash can only put text at the bottom).
 */
export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const t = useTranslation();

  useEffect(() => {
    const id = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <Animated.View
      exiting={FadeOut.duration(250)}
      style={s.root}
      onLayout={() => void SplashScreen.hideAsync()}
      accessibilityLabel={`Life Energy. ${t.splash.slogan}`}
    >
      <StatusBar backgroundColor={palette.sand900} barStyle="light-content" />
      <Image source={LOGO} style={s.logo} fadeDuration={0} />
      <View style={s.textSlot}>
        <Animated.View entering={FadeIn.duration(250)} style={s.text}>
          <Text style={s.name}>Life Energy</Text>
          <Text style={s.slogan}>{t.splash.slogan}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  // The native splash centres on the whole screen (status and nav bars included); the app draws below the status bar.
  root:     { position: 'absolute', left: 0, right: 0, top: -(StatusBar.currentHeight ?? 0), height: Dimensions.get('screen').height, backgroundColor: palette.sand900, alignItems: 'center', justifyContent: 'center' },
  logo:     { width: splashLogoSize, height: splashLogoSize },
  // Hangs below the centred logo so the logo stays exactly where the native splash drew it.
  textSlot: { position: 'absolute', top: '50%', left: 0, right: 0, marginTop: splashLogoSize * 0.25 },
  text:     { alignItems: 'center', gap: space.xs },
  name:     { fontFamily: 'Inter_700Bold', fontSize: fontSize.xxl, color: palette.amber500 },
  slogan:   { fontFamily: 'Inter_500Medium', fontSize: fontSize.callout, color: palette.sand300, paddingHorizontal: space.xl, textAlign: 'center' },
});
