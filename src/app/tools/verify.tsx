import Ionicons from '@expo/vector-icons/Ionicons'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const REQUIRED_READINGS = 3
const MAX_ACCURACY_METERS = 30
const MISSION_RADIUS_METERS = 50
const DEFAULT_TARGET = { latitude: 7.4356, longitude: 3.9143 }

type Target = typeof DEFAULT_TARGET

export default function VerifyPresenceScreen() {
  const insets = useSafeAreaInsets()
  const watcher = useRef<Location.LocationSubscription | null>(null)
  const targetRef = useRef<Target>(DEFAULT_TARGET)

  const [target, setTarget] = useState<Target>(DEFAULT_TARGET)
  const [permission, setPermission] = useState<'idle' | 'granted' | 'denied'>('idle')
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [tracking, setTracking] = useState(false)
  const [stableReadings, setStableReadings] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    return () => watcher.current?.remove()
  }, [])

  const accuracy = location?.coords.accuracy ?? null
  const distance = location
    ? distanceInMeters(
        location.coords.latitude,
        location.coords.longitude,
        target.latitude,
        target.longitude,
      )
    : null
  const isAccurate = accuracy !== null && accuracy <= MAX_ACCURACY_METERS
  const isInside = distance !== null && distance <= MISSION_RADIUS_METERS
  const isMocked = Boolean(location?.mocked)
  const verified = stableReadings >= REQUIRED_READINGS && isAccurate && isInside && (!isMocked || __DEV__)

  async function startLocationCheck() {
    setError(null)
    setStableReadings(0)

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync()
      if (!servicesEnabled) {
        setError('Location services are turned off on this device.')
        return
      }

      const result = await Location.requestForegroundPermissionsAsync()
      if (result.status !== 'granted') {
        setPermission('denied')
        setError('Precise location permission is required for Proof of Presence.')
        return
      }

      setPermission('granted')
      const first = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      handleReading(first)

      watcher.current?.remove()
      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1500,
        },
        handleReading,
      )
      setTracking(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read your location.')
    }
  }

  function handleReading(next: Location.LocationObject) {
    setLocation(next)

    const nextAccuracy = next.coords.accuracy ?? Number.POSITIVE_INFINITY
    const nextDistance = distanceInMeters(
      next.coords.latitude,
      next.coords.longitude,
      targetRef.current.latitude,
      targetRef.current.longitude,
    )
    const passes =
      nextAccuracy <= MAX_ACCURACY_METERS &&
      nextDistance <= MISSION_RADIUS_METERS &&
      (!next.mocked || __DEV__)

    setStableReadings((count) => (passes ? Math.min(REQUIRED_READINGS, count + 1) : 0))
  }

  function stopLocationCheck() {
    watcher.current?.remove()
    watcher.current = null
    setTracking(false)
  }

  function setDemoTargetHere() {
    if (!location) {
      Alert.alert('Start location first', 'Get one location reading before setting the emulator test target.')
      return
    }

    const nextTarget = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
    setTarget(nextTarget)
    targetRef.current = nextTarget
    setStableReadings(0)
  }

  function continueToCamera() {
    if (!verified) return
    stopLocationCheck()
    Alert.alert('Presence verified', 'Your live location passed. Next we will attach the in-app camera proof.')
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons color="#FFFFFF" name="chevron-back" size={20} />
          </Pressable>
          <Text style={styles.topTitle}>Proof of Presence</Text>
          <View style={styles.iconButtonGhost} />
        </View>

        <View style={styles.missionCard}>
          <View style={styles.orangeRail} />
          <Text style={styles.missionLabel}>LIVE CHECK</Text>
          <Text style={styles.missionTitle}>Is the Web3 meetup live?</Text>
          <Text style={styles.missionMeta}>Bodija, Ibadan · 50 m verification zone</Text>
        </View>

        <View style={styles.statusPanel}>
          <View style={[styles.ring, verified && styles.ringVerified]}>
            <View style={[styles.ringInner, verified && styles.ringInnerVerified]}>
              <Ionicons
                color={verified ? '#0B0B0C' : '#FF6800'}
                name={verified ? 'checkmark' : 'location'}
                size={28}
              />
            </View>
          </View>

          <Text style={styles.statusTitle}>
            {verified ? 'You are on-site' : tracking ? 'Checking your position' : 'Verify your location'}
          </Text>
          <Text style={styles.statusText}>
            {verified
              ? 'Three consistent precise readings confirmed.'
              : 'CrowdLens checks GPS accuracy and your distance from the mission point.'}
          </Text>

          <View style={styles.readingDots}>
            {Array.from({ length: REQUIRED_READINGS }).map((_, index) => (
              <View key={index} style={[styles.readingDot, index < stableReadings && styles.readingDotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric
            label="Accuracy"
            value={accuracy === null ? '—' : `±${Math.round(accuracy)} m`}
            good={isAccurate}
          />
          <Metric
            label="Distance"
            value={distance === null ? '—' : distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}
            good={isInside}
          />
        </View>

        <View style={styles.checkList}>
          <CheckRow
            active={permission === 'granted'}
            icon="navigate-outline"
            label="Location permission"
            detail={permission === 'denied' ? 'Denied' : permission === 'granted' ? 'Allowed' : 'Waiting'}
          />
          <CheckRow
            active={isAccurate}
            icon="locate-outline"
            label="Precise reading"
            detail={accuracy === null ? `Need ≤ ${MAX_ACCURACY_METERS} m` : `±${Math.round(accuracy)} m accuracy`}
          />
          <CheckRow
            active={isInside}
            icon="radio-outline"
            label="Inside mission zone"
            detail={distance === null ? `${MISSION_RADIUS_METERS} m radius` : `${Math.round(distance)} m from point`}
          />
          <CheckRow
            active={!isMocked || __DEV__}
            icon="shield-checkmark-outline"
            label="Location integrity"
            detail={isMocked && __DEV__ ? 'Emulator test mode' : isMocked ? 'Mock location detected' : 'No mock flag detected'}
          />
        </View>

        {location && (
          <View style={styles.coordinates}>
            <Text style={styles.coordinatesLabel}>LIVE COORDINATES</Text>
            <Text style={styles.coordinatesValue}>
              {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Ionicons color="#FF745E" name="alert-circle-outline" size={18} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {__DEV__ && location && (
          <Pressable onPress={setDemoTargetHere} style={styles.testButton}>
            <Ionicons color="#8A8A8E" name="flask-outline" size={16} />
            <Text style={styles.testButtonText}>Set mission point to current emulator location</Text>
          </Pressable>
        )}

        {!verified ? (
          <Pressable onPress={tracking ? stopLocationCheck : startLocationCheck} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{tracking ? 'Stop check' : 'Start location check'}</Text>
            <Ionicons color="#0B0B0C" name={tracking ? 'stop' : 'navigate'} size={18} />
          </Pressable>
        ) : (
          <Pressable onPress={continueToCamera} style={[styles.primaryButton, styles.verifiedButton]}>
            <Text style={styles.primaryButtonText}>Continue to live camera</Text>
            <Ionicons color="#0B0B0C" name="camera" size={18} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}

function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <View style={[styles.metric, good && styles.metricGood]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, good && styles.metricValueGood]}>{value}</Text>
    </View>
  )
}

function CheckRow({
  active,
  icon,
  label,
  detail,
}: {
  active: boolean
  icon: keyof typeof Ionicons.glyphMap
  label: string
  detail: string
}) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkIcon, active && styles.checkIconActive]}>
        <Ionicons color={active ? '#0B0B0C' : '#6F6F73'} name={icon} size={17} />
      </View>
      <View style={styles.checkCopy}>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={styles.checkDetail}>{detail}</Text>
      </View>
      <Ionicons color={active ? '#7BFF8A' : '#454548'} name={active ? 'checkmark-circle' : 'ellipse-outline'} size={18} />
    </View>
  )
}

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0B' },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  topTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center' },
  iconButtonGhost: { width: 40, height: 40 },
  missionCard: { backgroundColor: '#171719', borderRadius: 22, padding: 18, overflow: 'hidden', marginBottom: 14 },
  orangeRail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#FF6200' },
  missionLabel: { color: '#FF6A00', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  missionTitle: { color: '#FFFFFF', fontSize: 19, lineHeight: 24, fontWeight: '900', maxWidth: 260 },
  missionMeta: { color: '#6F6F73', fontSize: 10, marginTop: 8 },
  statusPanel: { minHeight: 270, borderRadius: 26, backgroundColor: '#121214', alignItems: 'center', justifyContent: 'center', padding: 22, marginBottom: 12 },
  ring: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#26170F', borderWidth: 2, borderColor: '#6D2D09', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  ringVerified: { backgroundColor: '#FF6200', borderColor: '#FF8A45' },
  ringInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0F0F11', borderWidth: 1, borderColor: '#4C2510', alignItems: 'center', justifyContent: 'center' },
  ringInnerVerified: { backgroundColor: '#FFB06F', borderColor: '#FFD0AA' },
  statusTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  statusText: { color: '#727276', fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 270, marginTop: 7 },
  readingDots: { flexDirection: 'row', gap: 7, marginTop: 16 },
  readingDot: { width: 22, height: 4, borderRadius: 2, backgroundColor: '#2D2D31' },
  readingDotActive: { backgroundColor: '#FF6200' },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metric: { flex: 1, minHeight: 90, borderRadius: 20, backgroundColor: '#151517', padding: 15, justifyContent: 'space-between' },
  metricGood: { backgroundColor: '#1A1715' },
  metricLabel: { color: '#66666A', fontSize: 10 },
  metricValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  metricValueGood: { color: '#FF6A00' },
  checkList: { borderRadius: 22, backgroundColor: '#121214', paddingHorizontal: 14, marginBottom: 12 },
  checkRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1E21' },
  checkIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#1C1C1F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  checkIconActive: { backgroundColor: '#FF6200' },
  checkCopy: { flex: 1 },
  checkLabel: { color: '#EDEDED', fontSize: 11, fontWeight: '800' },
  checkDetail: { color: '#616165', fontSize: 9, marginTop: 3 },
  coordinates: { borderRadius: 18, backgroundColor: '#151517', padding: 15, marginBottom: 12 },
  coordinatesLabel: { color: '#66666A', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  coordinatesValue: { color: '#D9D9DB', fontSize: 12, fontWeight: '700', marginTop: 6 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 16, backgroundColor: '#281715', padding: 13, marginBottom: 12 },
  errorText: { flex: 1, color: '#FF9B8C', fontSize: 10, lineHeight: 15 },
  testButton: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: '#141416', marginBottom: 10 },
  testButtonText: { color: '#858589', fontSize: 10, fontWeight: '700' },
  primaryButton: { height: 58, borderRadius: 18, backgroundColor: '#FF6200', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: '#FF6200', shadowOpacity: 0.3, shadowRadius: 14, elevation: 5 },
  verifiedButton: { backgroundColor: '#FF7A1A' },
  primaryButtonText: { color: '#0B0B0C', fontSize: 13, fontWeight: '900' },
})
