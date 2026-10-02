import Ionicons from '@expo/vector-icons/Ionicons'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const activity = [
  { icon: 'checkmark-circle-outline' as const, title: 'Mission completed', detail: 'Billboard installation verified', time: '12 min ago', accent: true },
  { icon: 'location-outline' as const, title: 'Scout arrived on-site', detail: 'Web3 meetup · Bodija', time: '34 min ago' },
  { icon: 'wallet-outline' as const, title: 'Reward released', detail: '3 test USDC sent to scout', time: '1 hr ago', accent: true },
  { icon: 'camera-outline' as const, title: 'Proof submitted', detail: 'Laptop stock check · Ring Road', time: 'Yesterday' },
]

export default function ActivityScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>TIMELINE</Text>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Track missions, proof submissions and reward events.</Text>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>ACTIVE MISSIONS</Text>
            <Text style={styles.summaryValue}>4</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>AWAITING REVIEW</Text>
            <Text style={styles.summaryValue}>2</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons color="#FF6A13" name="pulse" size={22} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>
        <View style={styles.list}>
          {activity.map((item, index) => (
            <View key={`${item.title}-${index}`} style={styles.item}>
              <View style={[styles.iconWrap, item.accent && styles.iconWrapAccent]}>
                <Ionicons color={item.accent ? '#FF6A13' : '#777777'} name={item.icon} size={19} />
              </View>
              <View style={styles.itemCopy}>
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
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  eyebrow: { color: '#FF5A00', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#7A7A7A', fontSize: 14, lineHeight: 20, marginTop: 8 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#15110F', borderColor: '#332116', borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 26, marginBottom: 28 },
  summaryLabel: { color: '#6D6D6D', fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginBottom: 6 },
  summaryValue: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  summaryDivider: { width: 1, height: 42, backgroundColor: '#30241E', marginHorizontal: 18 },
  summaryIcon: { marginLeft: 'auto', width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24150E' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  list: { gap: 2 },
  item: { minHeight: 78, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#191919', paddingVertical: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#141414', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconWrapAccent: { backgroundColor: '#21130C' },
  itemCopy: { flex: 1 },
  itemTitle: { color: '#ECECEC', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  itemDetail: { color: '#666666', fontSize: 11 },
  time: { color: '#555555', fontSize: 9, marginLeft: 10 },
})
