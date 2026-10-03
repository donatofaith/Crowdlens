import Ionicons from '@expo/vector-icons/Ionicons'
import { useStore } from '@nanostores/react'
import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { $missions } from '@/features/missions/data-access/mission-store'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const missions = useStore($missions)
  const closest = missions[0]

  function openClosestMission() {
    if (!closest) return
    router.push({
      pathname: '/tools/verify',
      params: {
        mission: closest.title,
        place: closest.place,
        reward: String(closest.reward),
        radius: String(closest.radius),
        targetLat: String(closest.targetLat),
        targetLon: String(closest.targetLon),
      },
    } as never)
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>CROWDLENS</Text>
            <Text style={styles.greeting}>Hi Faith</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.avatar}>
            <Text style={styles.avatarText}>F</Text>
          </Pressable>
        </View>

        <View style={styles.orangePanel}>
          <View style={styles.panelTop}>
            <View>
              <Text style={styles.panelSmall}>NEARBY NOW</Text>
              <Text style={styles.panelNumber}>{missions.length}</Text>
              <Text style={styles.panelLabel}>missions waiting</Text>
            </View>
            <View style={styles.radarButton}>
              <View style={styles.radarInner}>
                <Ionicons color="#FF7A18" name="radio-outline" size={26} />
              </View>
            </View>
          </View>

          <View style={styles.quickRow}>
            <Quick icon="navigate-outline" label="Nearby" onPress={() => router.push('/tools')} />
            <Quick icon="add" label="Create" onPress={() => router.push('/create')} />
            <Quick icon="pulse-outline" label="Active" onPress={() => router.push('/updates')} />
            <Quick icon="wallet-outline" label="Wallet" onPress={() => router.push('/settings')} />
          </View>
        </View>

        <Pressable onPress={() => router.push('/tools')} style={styles.searchPill}>
          <Ionicons color="#FF7A18" name="search" size={18} />
          <Text style={styles.searchText}>Browse missions</Text>
          <View style={styles.filterButton}>
            <Ionicons color="#D8D8D8" name="options-outline" size={17} />
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Closest mission</Text>
        {closest ? (
          <Pressable onPress={openClosestMission} style={styles.missionCard}>
            <View style={styles.cardIcon}>
              <Ionicons color="#FF7A18" name={closest.icon} size={22} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{closest.title}</Text>
              <Text style={styles.cardMeta}>{closest.place} · {closest.distanceLabel}</Text>
            </View>
            <View style={styles.rewardButton}>
              <Text style={styles.reward}>{closest.reward}</Text>
              <Text style={styles.rewardUnit}>USDC</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/create')} style={styles.emptyCard}>
            <Ionicons color="#FF7A18" name="add-circle-outline" size={24} />
            <Text style={styles.emptyText}>Create the first mission</Text>
          </Pressable>
        )}

        <View style={styles.quoteCard}>
          <Ionicons color="#FF7A18" name="location-outline" size={18} />
          <Text style={styles.quote}>Real-world proof, captured where it happens.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

function Quick({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem}>
      <View style={styles.quickButton}>
        <Ionicons color="#FF7A18" name={icon} size={18} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C0C0D' },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  kicker: { color: '#FF7A18', fontSize: 9, fontWeight: '900', letterSpacing: 1.6, marginBottom: 5 },
  greeting: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.7 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#18181A', borderWidth: 1, borderColor: '#29292C', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  avatarText: { color: '#FF7A18', fontWeight: '900', fontSize: 14 },
  orangePanel: { backgroundColor: '#F36B08', borderRadius: 30, padding: 20, marginBottom: 18, elevation: 14, shadowColor: '#FF6A00', shadowOpacity: 0.22, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelSmall: { color: 'rgba(0,0,0,0.58)', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  panelNumber: { color: '#111111', fontSize: 46, fontWeight: '900', lineHeight: 50, marginTop: 5 },
  panelLabel: { color: 'rgba(0,0,0,0.66)', fontSize: 11, fontWeight: '700' },
  radarButton: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: '#000', shadowOpacity: 0.34, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  radarInner: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: '#FF7A18', alignItems: 'center', justifyContent: 'center', backgroundColor: '#171719' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  quickItem: { alignItems: 'center', width: 64 },
  quickButton: { width: 47, height: 47, borderRadius: 18, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2B2B2E', elevation: 8, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  quickLabel: { color: '#1A1A1A', fontSize: 9, fontWeight: '800', marginTop: 7 },
  searchPill: { height: 54, borderRadius: 18, backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 7, marginBottom: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  searchText: { flex: 1, color: '#66666A', fontSize: 11, marginLeft: 10 },
  filterButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#202023', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 11 },
  missionCard: { minHeight: 88, borderRadius: 23, backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', flexDirection: 'row', alignItems: 'center', padding: 14, elevation: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 7 } },
  cardIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#25160E', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#F4F4F4', fontSize: 13, fontWeight: '800' },
  cardMeta: { color: '#66666A', fontSize: 10, marginTop: 5 },
  rewardButton: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#F36B08', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  reward: { color: '#111111', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  rewardUnit: { color: 'rgba(0,0,0,0.62)', fontSize: 7, fontWeight: '900', marginTop: 2 },
  emptyCard: { minHeight: 88, borderRadius: 23, backgroundColor: '#151517', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  emptyText: { color: '#B0B0B4', fontSize: 12, fontWeight: '800' },
  quoteCard: { marginTop: 14, borderRadius: 19, backgroundColor: '#121214', flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#1D1D20' },
  quote: { color: '#78787C', fontSize: 10, marginLeft: 9, flex: 1 },
})
