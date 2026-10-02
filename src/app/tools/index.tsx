import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const missions = [
  { title: 'Is the Web3 meetup live?', place: 'Bodija', distance: '1.2 km', reward: '3 USDC', icon: 'radio-outline' as const },
  { title: 'Is this laptop still in stock?', place: 'Ring Road', distance: '2.8 km', reward: '5 USDC', icon: 'cube-outline' as const },
  { title: 'Confirm this billboard is up', place: 'Iwo Road', distance: '4.1 km', reward: '4 USDC', icon: 'camera-outline' as const },
  { title: 'How long is the queue here?', place: 'Dugbe', distance: '5.4 km', reward: '2 USDC', icon: 'people-outline' as const },
]

export default function MissionsScreen() {
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState('Nearby')

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Missions</Text>
            <Text style={styles.subtitle}>What needs checking nearby.</Text>
          </View>
          <Pressable style={styles.searchButton}>
            <Ionicons color="#F5F5F5" name="search" size={19} />
          </Pressable>
        </View>

        <View style={styles.filters}>
          {['Nearby', 'Reward', 'New'].map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {missions.map((mission, index) => (
            <Pressable key={mission.title} style={[styles.card, index === 0 && styles.featuredCard]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, index === 0 && styles.iconBoxActive]}>
                  <Ionicons color={index === 0 ? '#FF6413' : '#A0A0A0'} name={mission.icon} size={20} />
                </View>
                <Text style={styles.reward}>{mission.reward}</Text>
              </View>

              <Text style={styles.cardTitle}>{mission.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{mission.place}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>{mission.distance}</Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.proof}>Live proof</Text>
                <Ionicons color="#FFFFFF" name="arrow-forward" size={16} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0C' },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#707070', fontSize: 12, marginTop: 5 },
  searchButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 12, backgroundColor: '#141416' },
  filterActive: { backgroundColor: '#F05A0A' },
  filterText: { color: '#707070', fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  list: { gap: 12 },
  card: { backgroundColor: '#151517', borderRadius: 20, padding: 17 },
  featuredCard: { backgroundColor: '#1B1714' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#202023', alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: '#2B190F' },
  reward: { color: '#FF6413', fontSize: 11, fontWeight: '800' },
  cardTitle: { color: '#FFFFFF', fontSize: 17, lineHeight: 22, fontWeight: '800', maxWidth: 255 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  meta: { color: '#717171', fontSize: 10 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#565656' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  proof: { color: '#8A8A8A', fontSize: 10, fontWeight: '600' },
})
