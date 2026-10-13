import { Link, Stack } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'
import { fontSize } from '@/theme/typography';
import { space } from '@/theme/layout';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text>Go to home screen</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  title: { fontSize: fontSize.xl, fontWeight: 'bold' },
  link: { marginTop: space.lg, paddingVertical: space.lg },
})
