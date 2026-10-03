import Ionicons from '@expo/vector-icons/Ionicons'
import { useStore } from '@nanostores/react'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { $missions } from '@/features/missions/data-access/mission-store'

export default function MissionsScreen() {
  const insets = useSafeAreaInsets()
  const missions = useStore($missions)
  const [filter, setFilter] = useState('Nearby')

  const visibleMissions = useMemo(() => {
    const copy = [...missions]
    if (filter === 'Reward') return copy.sort((a, b) => b.reward - a.reward)
    if (filter === 'New') return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return copy
  }, [filter, missions])

  function openMission(mission: (typeof visibleMissions)[number]) {
    router.push({
      pathname: '/tools/verify',
      params: {
        mission: mission.title,
        place: mission.place,
        reward: String(mission.reward),
        radius: String(mission.radius),
        targetLat: String(mission.targetLat),
        targetLon: String(mission.targetLon),
      },
    } as never)
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>DISCOVER</Text>
            <Text style={styles.title}>Missions</Text>
          </View>
          <Pressable onPress={() => router.push('/create')} style={styles.searchButton}>
            <Ionicons color="#FF7A18" name="add" size={21} />
          </Pressable>
        </View>

        <View style={styles.segmentWrap}>
          {['Nearby', 'Reward', 'New'].map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.segment, filter === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, filter === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {visibleMissions.map((mission, index) => (
            <Pressable key={mission.id} onPress={() => openMission(mission)} style={[styles.card, index === 0 && styles.cardFeatured]}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconButton, index === 0 && styles.iconButtonFeatured]}>
                  <Ionicons color={index === 0 ? '#111111' : '#FF7A18'} name={mission.icon} size={20} />
                </View>
              </View>

              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, index === 0 && styles.cardTitleFeatured]}>{mission.title}</Text>
                <Text style={[styles.cardMeta, index === 0 && styles.cardMetaFeatured]}>
                  {mission.place} · {mission.distanceLabel}
                </Text>
                {mission.source === 'local' && <Text style={styles.localBadge}>CREATED ON THIS DEVICE</Text>}
              </View>

              <View style={[styles.rewardOrb, index === 0 && styles.rewardOrbFeatured]}>
                <Text style={styles.reward}>{mission.reward}</Text>
                <Text style={styles.unit}>USDC</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C0C0D' },
  content: { paddingHorizontal: 18, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  kicker: { color: '#FF7A18', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.9 },
  searchButton: { width: 44, height: 44, borderRadius: 17, backgroundColor: '#171719', borderWidth: 1, borderColor: '#29292C', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  segmentWrap: { flexDirection: 'row', backgroundColor: '#151517', borderRadius: 19, padding: 5, marginBottom: 20, borderWidth: 1, borderColor: '#242427' },
  segment: { flex: 1, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#F36B08', elevation: 5, shadowColor: '#FF6A00', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  segmentText: { color: '#6F6F73', fontSize: 10, fontWeight: '800' },
  segmentTextActive: { color: '#111111' },
  list: { gap: 13 },
  card: { minHeight: 96, backgroundColor: '#151517', borderRadius: 25, borderWidth: 1, borderColor: '#242427', padding: 13, flexDirection: 'row', alignItems: 'center', elevation: 7, shadowColor: '#000', shadowOpacity: 0.26, shadowRadius: 11, shadowOffset: { width: 0, height: 6 } },
  cardFeatured: { backgroundColor: '#F36B08', borderColor: '#F36B08' },
  cardLeft: { marginRight: 12 },
  iconButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center' },
  iconButtonFeatured: { backgroundColor: '#111113' },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#F4F4F4', fontSize: 13, lineHeight: 18, fontWeight: '800', maxWidth: 190 },
  cardTitleFeatured: { color: '#111113' },
  cardMeta: { color: '#6D6D71', fontSize: 9, marginTop: 6 },
  cardMetaFeatured: { color: 'rgba(0,0,0,0.55)' },
  localBadge: { color: '#FF7A18', fontSize: 7, fontWeight: '900', letterSpacing: 0.6, marginTop: 6 },
  rewardOrb: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#202023', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  rewardOrbFeatured: { backgroundColor: '#111113' },
  reward: { color: '#FF7A18', fontSize: 17, fontWeight: '900', lineHeight: 19 },
  unit: { color: '#8A8A8E', fontSize: 7, fontWeight: '900', marginTop: 2 },
})
