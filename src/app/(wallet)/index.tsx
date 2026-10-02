import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.mark}>
            <View style={[styles.markBar, { height: 10 }]} />
            <View style={[styles.markBar, { height: 18 }]} />
            <View style={[styles.markBar, { height: 7 }]} />
          </View>

          <Pressable onPress={() => router.push('/settings')} style={styles.avatar}>
            <Text style={styles.avatarText}>F</Text>
          </Pressable>
        </View>

        <Text style={styles.hello}>Hi Faith</Text>
        <Text style={styles.subtitle}>3 missions are waiting nearby</Text>

        <Pressable onPress={() => router.push('/tools')} style={styles.featuredCard}>
          <View style={styles.featuredGlow} />
          <RadarPulse />

          <View style={styles.featuredCopy}>
            <Text style={styles.featuredLabel}>LIVE CHECK</Text>
            <Text style={styles.featuredTitle}>Is the Web3 meetup live?</Text>
            <Text style={styles.featuredLocation}>Bodija, Ibadan · 1.2 km</Text>

            <View style={styles.featuredFooter}>
              <View style={styles.peopleRow}>
                <View style={[styles.person, styles.personOne]}>
                  <Text style={styles.personText}>A</Text>
                </View>
                <View style={[styles.person, styles.personTwo]}>
                  <Text style={styles.personText}>K</Text>
                </View>
              </View>
              <Text style={styles.reward}>3 USDC</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          <Pressable onPress={() => router.push('/create')} style={styles.createButton}>
            <Ionicons color="#0B0B0B" name="add" size={22} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          <Pressable onPress={() => router.push('/tools')} style={[styles.tile, styles.tallTile]}>
            <View style={styles.tileIcon}>
              <Ionicons color="#FF6200" name="location-outline" size={19} />
            </View>
            <View>
              <Text style={styles.tileValue}>4</Text>
              <Text style={styles.tileLabel}>Nearby</Text>
            </View>
          </Pressable>

          <View style={styles.rightColumn}>
            <Pressable onPress={() => router.push('/updates')} style={styles.tile}>
              <Text style={styles.tileValue}>2</Text>
              <Text style={styles.tileLabel}>Active</Text>
            </Pressable>

            <View style={[styles.tile, styles.orangeTile]}>
              <Text style={[styles.tileValue, styles.orangeTileValue]}>18.4</Text>
              <Text style={[styles.tileLabel, styles.orangeTileLabel]}>USDC earned</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function RadarPulse() {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
    )
    animation.start()
    return () => animation.stop()
  }, [pulse])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.55] })
  const opacity = pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.38, 0.12, 0] })

  return (
    <View pointerEvents="none" style={styles.radarWrap}>
      <Animated.View style={[styles.radarRing, { opacity, transform: [{ scale }] }]} />
      <View style={styles.radarRingStatic} />
      <View style={styles.radarDot} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  mark: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingTop: 2,
  },
  markBar: {
    width: 3,
    borderRadius: 3,
    backgroundColor: '#A4A4A4',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171719',
    borderWidth: 1,
    borderColor: '#2B2B2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FF6A00',
    fontSize: 14,
    fontWeight: '800',
  },
  hello: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: '#67676B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 22,
  },
  featuredCard: {
    minHeight: 150,
    borderRadius: 19,
    backgroundColor: '#171719',
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'center',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#202023',
  },
  featuredGlow: {
    position: 'absolute',
    right: -38,
    top: -38,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#B84000',
    opacity: 0.3,
  },
  featuredCopy: {
    width: '72%',
  },
  featuredLabel: {
    color: '#FF6A00',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  featuredLocation: {
    color: '#707074',
    fontSize: 10,
    marginTop: 7,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },
  peopleRow: {
    flexDirection: 'row',
    flex: 1,
  },
  person: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#171719',
  },
  personOne: {
    backgroundColor: '#6B5044',
  },
  personTwo: {
    backgroundColor: '#4D5868',
    marginLeft: -6,
  },
  personText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  reward: {
    color: '#A5A5A7',
    fontSize: 10,
    fontWeight: '700',
  },
  radarWrap: {
    position: 'absolute',
    right: 13,
    top: 26,
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FF6A00',
  },
  radarRingStatic: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.35)',
  },
  radarDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF6A00',
    borderWidth: 2,
    borderColor: '#24150C',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  createButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FF6200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    minHeight: 178,
  },
  rightColumn: {
    flex: 1,
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#171719',
    borderWidth: 1,
    borderColor: '#202023',
    padding: 16,
    justifyContent: 'space-between',
  },
  tallTile: {
    flex: 1,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#24150D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeTile: {
    backgroundColor: '#EF5B00',
    borderColor: '#EF5B00',
  },
  tileValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  tileLabel: {
    color: '#66666A',
    fontSize: 10,
    marginTop: 3,
  },
  orangeTileValue: {
    color: '#FFFFFF',
  },
  orangeTileLabel: {
    color: 'rgba(255,255,255,0.72)',
  },
})
