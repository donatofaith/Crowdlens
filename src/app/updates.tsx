import Ionicons from '@expo/vector-icons/Ionicons'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const activity = [
  { icon: 'checkmark' as const, title: 'Mission completed', detail: 'Billboard verified', time: '12m', accent: true },
  { icon: 'location-outline' as const, title: 'Scout arrived', detail: 'Web3 meetup · Bodija', time: '34m' },
  { icon: 'wallet-outline' as const, title: 'Reward released', detail: '3 test USDC', time: '1h', accent: true },
  { icon: 'camera-outline' as const, title: 'Proof submitted', detail: 'Laptop stock check', time: 'Yesterday' },
]

export default function ActivityScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>What changed recently.</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statActive]}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={styles.timeline}>
          {activity.map((item, index) => (
            <View key={`${item.title}-${index}`} style={styles.item}>
              <View style={[styles.iconWrap, item.accent && styles.iconWrapAccent]}>
                <Ionicons color={item.accent ? '#FF6413' : '#888888'} name={item.icon} size={18} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0C' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#707070', fontSize: 12, marginTop: 5 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 26, marginBottom: 30 },
  statCard: { flex: 1, minHeight: 92, borderRadius: 18, backgroundColor: '#151517', padding: 16, justifyContent: 'center' },
  statActive: { backgroundColor: '#25170F' },
  statValue: { color: '#FFFFFF', fontSize: 25, fontWeight: '800' },
  statLabel: { color: '#747474', fontSize: 10, marginTop: 5 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  timeline: { gap: 2 },
  item: { minHeight: 72, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#18181A' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconWrapAccent: { backgroundColor: '#2A190F' },
  copy: { flex: 1 },
  itemTitle: { color: '#EDEDED', fontSize: 12, fontWeight: '700' },
  itemDetail: { color: '#666666', fontSize: 10, marginTop: 4 },
  time: { color: '#555555', fontSize: 9, marginLeft: 10 },
})
