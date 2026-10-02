import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const missions = [
  {
    id: '1',
    tag: 'LIVE CHECK',
    title: 'Is the Web3 meetup happening right now?',
    location: 'Bodija, Ibadan',
    distance: '1.2 km',
    reward: '3 USDC',
  },
  {
    id: '2',
    tag: 'STOCK CHECK',
    title: 'Confirm this laptop is still available in-store',
    location: 'Ring Road, Ibadan',
    distance: '2.8 km',
    reward: '5 USDC',
  },
  {
    id: '3',
    tag: 'PHOTO PROOF',
    title: 'Verify this billboard has been installed',
    location: 'Iwo Road, Ibadan',
    distance: '4.1 km',
    reward: '4 USDC',
  },
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <View style={styles.orangeGlow} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandMark} />
              <Text style={styles.brand}>CrowdLens</Text>
            </View>
            <Text style={styles.greeting}>Good evening, Faith</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>FO</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons color="#FF6A13" name="eye-outline" size={24} />
          </View>
          <Text style={styles.heroEyebrow}>REAL-WORLD PROOF, ON DEMAND</Text>
          <Text style={styles.heroTitle}>See what is happening anywhere.</Text>
          <Text style={styles.heroText}>
            Ask nearby people to verify a place, product or event and receive fresh proof from the real world.
          </Text>

          <Pressable onPress={() => router.push('/create')} style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Create a mission</Text>
            <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your overview</Text>
          <Text style={styles.sectionHint}>This week</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Completed" value="12" />
          <StatCard label="Active" value="4" />
          <StatCard label="Earned" value="$18.40" highlight />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby missions</Text>
          <Pressable onPress={() => router.push('/tools')}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.missionList}>
          {missions.map((mission) => (
            <Pressable key={mission.id} onPress={() => router.push('/tools')} style={styles.missionCard}>
              <View style={styles.missionTopRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{mission.tag}</Text>
                </View>
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardText}>{mission.reward}</Text>
                </View>
              </View>

              <Text style={styles.missionTitle}>{mission.title}</Text>

              <View style={styles.missionMeta}>
                <View style={styles.metaItem}>
                  <Ionicons color="#7B7B7B" name="location-outline" size={15} />
                  <Text style={styles.metaText}>{mission.location}</Text>
                </View>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{mission.distance}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  orangeGlow: {
    position: 'absolute',
    right: -90,
    top: 60,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#7A2700',
    opacity: 0.22,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandMark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A00',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FF6A13',
    fontWeight: '800',
    fontSize: 13,
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: '#15110F',
    borderWidth: 1,
    borderColor: '#332116',
    padding: 22,
    marginBottom: 28,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#24150E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroEyebrow: {
    color: '#FF6A13',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.9,
    maxWidth: 290,
  },
  heroText: {
    color: '#9B9B9B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 320,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 22,
    backgroundColor: '#FF5A00',
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionHint: {
    color: '#656565',
    fontSize: 12,
  },
  viewAll: {
    color: '#FF6A13',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minHeight: 94,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#202020',
    padding: 14,
    justifyContent: 'center',
  },
  statCardHighlight: {
    backgroundColor: '#1C120D',
    borderColor: '#3B2417',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 5,
  },
  statValueHighlight: {
    color: '#FF6A13',
  },
  statLabel: {
    color: '#6F6F6F',
    fontSize: 11,
  },
  missionList: {
    gap: 12,
  },
  missionCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#202020',
    padding: 18,
  },
  missionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#858585',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  rewardPill: {
    borderRadius: 999,
    backgroundColor: '#23140D',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rewardText: {
    color: '#FF6A13',
    fontSize: 11,
    fontWeight: '800',
  },
  missionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: -0.25,
    maxWidth: 310,
  },
  missionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#737373',
    fontSize: 11,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4D4D4D',
  },
})
