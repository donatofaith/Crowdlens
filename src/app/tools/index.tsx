import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const missions = [
  ['LIVE CHECK', 'Is the Web3 meetup happening right now?', 'Bodija, Ibadan', '1.2 km', '3 USDC'],
  ['STOCK CHECK', 'Confirm this laptop is still available in-store', 'Ring Road, Ibadan', '2.8 km', '5 USDC'],
  ['PHOTO PROOF', 'Verify this billboard has been installed', 'Iwo Road, Ibadan', '4.1 km', '4 USDC'],
  ['QUEUE CHECK', 'How long is the queue at this office right now?', 'Dugbe, Ibadan', '5.4 km', '2 USDC'],
]

export default function MissionsScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>DISCOVER</Text>
        <Text style={styles.title}>Nearby missions</Text>
        <Text style={styles.subtitle}>Fresh tasks people need verified in the real world.</Text>

        <View style={styles.filters}>
          {['Nearby', 'Highest reward', 'Newest'].map((item, index) => (
            <Pressable key={item} style={[styles.filter, index === 0 && styles.filterActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {missions.map(([tag, title, location, distance, reward]) => (
            <Pressable key={title} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                <Text style={styles.reward}>{reward}</Text>
              </View>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={styles.metaRow}>
                <Ionicons color="#737373" name="location-outline" size={15} />
                <Text style={styles.meta}>{location}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>{distance}</Text>
              </View>
              <View style={styles.footerRow}>
                <View style={styles.presenceBadge}>
                  <Ionicons color="#FF6A13" name="shield-checkmark-outline" size={15} />
                  <Text style={styles.presenceText}>Proof of Presence</Text>
                </View>
                <Ionicons color="#FFFFFF" name="arrow-forward-circle-outline" size={26} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  eyebrow: { color: '#FF5A00', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#7B7B7B', fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 310 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 20 },
  filter: { borderWidth: 1, borderColor: '#242424', backgroundColor: '#121212', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 },
  filterActive: { backgroundColor: '#FF5A00', borderColor: '#FF5A00' },
  filterText: { color: '#777777', fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  list: { gap: 12 },
  card: { backgroundColor: '#121212', borderRadius: 22, borderWidth: 1, borderColor: '#202020', padding: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tag: { backgroundColor: '#1B1B1B', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { color: '#878787', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  reward: { color: '#FF6A13', fontSize: 12, fontWeight: '900' },
  cardTitle: { color: '#FFFFFF', fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  meta: { color: '#747474', fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#4A4A4A' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1F1F1F' },
  presenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  presenceText: { color: '#8C8C8C', fontSize: 11, fontWeight: '600' },
})
