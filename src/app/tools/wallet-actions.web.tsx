import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function WebOnlyInfo() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.kicker}>CROWDLENS · WEB PREVIEW</Text>
        <Text style={styles.heading}>Wallet actions</Text>
        <Text style={styles.message}>The wallet signing tools require the Android application in this preview.</Text>
        <Pressable onPress={() => router.replace('/tools')} style={styles.button}>
          <Text style={styles.buttonLabel}>Explore missions</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C0C0D', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', padding: 24, borderRadius: 26, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { color: '#FF7A18', fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  heading: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  message: { color: '#B2B2B7', fontSize: 15, lineHeight: 23 },
  button: { backgroundColor: '#F36B08', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  buttonLabel: { color: '#111111', fontSize: 14, fontWeight: '800' },
})
