import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const missions = [
  { title: 'Is the Web3 meetup live?', place: 'Bodija', distance: '1.2 km', reward: '3', icon: 'radio-outline' as const },
  { title: 'Is this laptop still in stock?', place: 'Ring Road', distance: '2.8 km', reward: '5', icon: 'cube-outline' as const },
  { title: 'Confirm this billboard is up', place: 'Iwo Road', distance: '4.1 km', reward: '4', icon: 'camera-outline' as const },
  { title: 'How long is the queue here?', place: 'Dugbe', distance: '5.4 km', reward: '2', icon: 'people-outline' as const },
]

export default function MissionsScreen() {
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState('Nearby')

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>DISCOVER</Text>
            <Text style={styles.title}>Missions</Text>
          </View>
          <Pressable style={styles.searchButton}>
            <Ionicons color="#FF7A18" name="search" size={19} />
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
          {missions.map((mission, index) => (
            <Pressable
              key={mission.title}
              onPress={() => router.push('/tools/verify')}
              style={[styles.card, index === 0 && styles.cardFeatured]}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconButton, index === 0 && styles.iconButtonFeatured]}>
                  <Ionicons color={index === 0 ? '#111111' : '#FF7A18'} name={mission.icon} size={20} />
                </View>
              </View>

              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{mission.title}</Text>
                <Text style={styles.cardMeta}>{mission.place} · {mission.distance}</Text>
              </View>

              <View style={[styles.rewardOrb, index === 0 && styles.rewardOrbFeatured]}>
                <Text style={[styles.reward, index === 0 && styles.rewardFeatured]}>{mission.reward}</Text>
                <Text style={[styles.unit, index === 0 && styles.unitFeatured]}>USDC</Text>
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
  cardMeta: { color: '#6D6D71', fontSize: 9, marginTop: 6 },
  rewardOrb: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#202023', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  rewardOrbFeatured: { backgroundColor: '#111113' },
  reward: { color: '#FF7A18', fontSize: 17, fontWeight: '900', lineHeight: 19 },
  rewardFeatured: { color: '#FF7A18' },
  unit: { color: '#6C6C70', fontSize: 7, fontWeight: '900', marginTop: 2 },
  unitFeatured: { color: '#A0A0A3' },
})
