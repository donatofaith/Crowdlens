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
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>TRACKING</Text>
        <Text style={styles.title}>Activity</Text>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>4</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryValue}>2</Text>
            <Text style={styles.summaryLabel}>Review</Text>
          </View>
          <View style={styles.pulseOrb}>
            <Ionicons color="#FF7A18" name="pulse" size={23} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={styles.list}>
          {activity.map((item, index) => (
            <View key={`${item.title}-${index}`} style={styles.item}>
              <View style={[styles.iconWrap, item.accent && styles.iconWrapAccent]}>
                <Ionicons color={item.accent ? '#111111' : '#FF7A18'} name={item.icon} size={18} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
              <View style={styles.timePill}><Text style={styles.time}>{item.time}</Text></View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C0C0D' },
  content: { paddingHorizontal: 18, paddingBottom: 30 },
  kicker: { color: '#FF7A18', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  summaryPanel: { marginTop: 20, minHeight: 116, borderRadius: 28, backgroundColor: '#F36B08', flexDirection: 'row', alignItems: 'center', padding: 18, marginBottom: 26, elevation: 12, shadowColor: '#FF6A00', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 9 } },
  summaryBlock: { minWidth: 64 },
  summaryValue: { color: '#111111', fontSize: 30, fontWeight: '900' },
  summaryLabel: { color: 'rgba(0,0,0,0.58)', fontSize: 10, fontWeight: '800', marginTop: 2 },
  summaryDivider: { width: 1, height: 46, backgroundColor: 'rgba(0,0,0,0.16)', marginHorizontal: 16 },
  pulseOrb: { marginLeft: 'auto', width: 64, height: 64, borderRadius: 24, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 11, shadowOffset: { width: 0, height: 6 } },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 11 },
  list: { gap: 11 },
  item: { minHeight: 76, borderRadius: 22, backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', flexDirection: 'row', alignItems: 'center', padding: 11, elevation: 6, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 5 } },
  iconWrap: { width: 46, height: 46, borderRadius: 17, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  iconWrapAccent: { backgroundColor: '#F36B08' },
  copy: { flex: 1 },
  itemTitle: { color: '#F0F0F0', fontSize: 12, fontWeight: '800' },
  itemDetail: { color: '#66666A', fontSize: 9, marginTop: 4 },
  timePill: { backgroundColor: '#202023', borderRadius: 11, paddingHorizontal: 8, paddingVertical: 6, marginLeft: 8 },
  time: { color: '#7A7A7E', fontSize: 8, fontWeight: '800' },
})
