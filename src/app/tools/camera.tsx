import Ionicons from '@expo/vector-icons/Ionicons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { router, useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WalletUiConnectButton } from '@/features/wallet/ui/wallet-ui-connect-button'
import { executeWalletSignMessage } from '@/features/wallet/util/execute-wallet-sign-message'

const MAX_ACCURACY_METERS = 30
const DEFAULT_RADIUS_METERS = 50
const CHALLENGES = [
  'Capture the venue entrance with the main sign visible.',
  'Capture the entrance and visible live activity in the same frame.',
  'Capture the main doorway with a clear identifying feature of the venue.',
]

type CapturedProof = {
  uri: string
  width: number
  height: number
  timestamp: string
  latitude: number
  longitude: number
  accuracy: number
  distance: number
  mocked: boolean
}

export default function LiveCameraScreen() {
  const insets = useSafeAreaInsets()
  const cameraRef = useRef<CameraView | null>(null)
  const wallet = useMobileWallet()
  const params = useLocalSearchParams<{
    targetLat?: string
    targetLon?: string
    radius?: string
    mission?: string
    place?: string
    reward?: string
  }>()

  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [cameraReady, setCameraReady] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [proof, setProof] = useState<CapturedProof | null>(null)
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [challenge] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)])

  const targetLat = Number(params.targetLat)
  const targetLon = Number(params.targetLon)
  const radius = Number(params.radius) || DEFAULT_RADIUS_METERS
  const mission = params.mission || 'Is the Web3 meetup live?'
  const place = params.place || 'Bodija, Ibadan'
  const reward = params.reward || '3'
  const hasTarget = Number.isFinite(targetLat) && Number.isFinite(targetLon)
  const walletAddress = wallet.account?.address.toString()

  async function captureLiveProof() {
    if (!cameraReady || capturing || !cameraRef.current) return
    if (!hasTarget) {
      Alert.alert('Mission location missing', 'Return to the mission and verify your location again.')
      return
    }

    setCapturing(true)
    try {
      const locationPermission = await Location.getForegroundPermissionsAsync()
      if (locationPermission.status !== 'granted') {
        Alert.alert('Location required', 'CrowdLens must re-check your location at the exact moment the photo is captured.')
        return
      }

      const liveLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
      const accuracy = liveLocation.coords.accuracy ?? Number.POSITIVE_INFINITY
      const distance = distanceInMeters(liveLocation.coords.latitude, liveLocation.coords.longitude, targetLat, targetLon)
      const mocked = Boolean(liveLocation.mocked)

      if (accuracy > MAX_ACCURACY_METERS) {
        Alert.alert('GPS is not precise enough', `Current accuracy is ±${Math.round(accuracy)} m. Wait for ±${MAX_ACCURACY_METERS} m or better.`)
        return
      }

      if (distance > radius) {
        Alert.alert('You moved outside the mission zone', `You are ${Math.round(distance)} m from the mission point. Move back inside the ${radius} m zone.`)
        return
      }

      if (mocked && !__DEV__) {
        Alert.alert('Location integrity check failed', 'A mock location was detected. Live proof cannot be captured.')
        return
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82, exif: false })
      if (!photo) throw new Error('The camera did not return a photo.')

      setProof({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        timestamp: new Date().toISOString(),
        latitude: liveLocation.coords.latitude,
        longitude: liveLocation.coords.longitude,
        accuracy,
        distance,
        mocked,
      })
      setSignature(null)
    } catch (error) {
      Alert.alert('Could not capture proof', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setCapturing(false)
    }
  }

  async function signProof() {
    if (!proof || !walletAddress || signing) return

    setSigning(true)
    try {
      const payload = [
        'CROWDLENS_PROOF_V1',
        `mission=${mission}`,
        `place=${place}`,
        `challenge=${challenge}`,
        `capturedAt=${proof.timestamp}`,
        `latitude=${proof.latitude.toFixed(6)}`,
        `longitude=${proof.longitude.toFixed(6)}`,
        `accuracyMeters=${Math.round(proof.accuracy)}`,
        `distanceMeters=${Math.round(proof.distance)}`,
        `photo=${proof.width}x${proof.height}`,
      ].join('\n')

      const signed = await executeWalletSignMessage({ text: payload, signMessages: wallet.signMessages })
      setSignature(signed)
    } catch (error) {
      Alert.alert('Could not sign proof', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSigning(false)
    }
  }

  function submitProof() {
    if (!proof || !signature || !walletAddress) return

    router.push({
      pathname: '/tools/review',
      params: {
        mission,
        place,
        reward,
        challenge,
        photoUri: proof.uri,
        capturedAt: proof.timestamp,
        latitude: String(proof.latitude),
        longitude: String(proof.longitude),
        accuracy: String(proof.accuracy),
        distance: String(proof.distance),
        scout: walletAddress,
        proofSignature: signature,
      },
    } as never)
  }

  if (!permission) {
    return <View style={styles.centerScreen}><ActivityIndicator color="#FF6A00" /></View>
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionScreen, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.permissionIcon}><Ionicons color="#FF6A00" name="camera" size={30} /></View>
        <Text style={styles.permissionTitle}>Live camera required</Text>
        <Text style={styles.permissionText}>CrowdLens only accepts proof captured inside the app. Gallery uploads are not available for verification missions.</Text>
        <Pressable onPress={() => void requestPermission()} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Allow camera</Text>
          <Ionicons color="#0A0A0B" name="arrow-forward" size={18} />
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backTextButton}><Text style={styles.backText}>Go back</Text></Pressable>
      </View>
    )
  }

  if (proof) {
    return (
      <View style={styles.screen}>
        <View style={[styles.reviewContent, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => { setProof(null); setSignature(null) }} style={styles.iconButton}>
              <Ionicons color="#FFFFFF" name="chevron-back" size={20} />
            </Pressable>
            <Text style={styles.topTitle}>{signature ? 'Proof ready' : 'Review proof'}</Text>
            <View style={styles.iconButtonGhost} />
          </View>

          <View style={styles.reviewImageWrap}>
            <Image source={{ uri: proof.uri }} style={styles.reviewImage} resizeMode="cover" />
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE CAPTURE</Text></View>
          </View>

          <View style={styles.metaCard}>
            <MetaRow icon="time-outline" label="Captured" value={new Date(proof.timestamp).toLocaleTimeString()} />
            <MetaRow icon="location-outline" label="Coordinates" value={`${proof.latitude.toFixed(5)}, ${proof.longitude.toFixed(5)}`} />
            <MetaRow icon="locate-outline" label="GPS" value={`±${Math.round(proof.accuracy)} m · ${Math.round(proof.distance)} m from mission`} />
            <MetaRow icon="camera-outline" label="Source" value="CrowdLens camera" />
          </View>

          {signature ? (
            <>
              <View style={styles.signedCard}>
                <View style={styles.signedIcon}><Ionicons color="#0A0A0B" name="checkmark" size={22} /></View>
                <View style={styles.signedCopy}>
                  <Text style={styles.signedTitle}>Proof signed by wallet</Text>
                  <Text style={styles.signedText} numberOfLines={1}>{walletAddress}</Text>
                  <Text style={styles.signatureText} numberOfLines={1}>{signature}</Text>
                </View>
              </View>
              <Pressable onPress={submitProof} style={[styles.primaryButton, styles.submitButton]}>
                <Text style={styles.primaryButtonText}>Submit proof</Text>
                <Ionicons color="#0A0A0B" name="arrow-forward" size={19} />
              </Pressable>
            </>
          ) : walletAddress ? (
            <Pressable onPress={() => void signProof()} disabled={signing} style={styles.primaryButton}>
              {signing ? <ActivityIndicator color="#0A0A0B" /> : <Ionicons color="#0A0A0B" name="finger-print" size={20} />}
              <Text style={styles.primaryButtonText}>{signing ? 'Signing…' : 'Sign this proof'}</Text>
            </Pressable>
          ) : (
            <View style={styles.walletCard}>
              <Text style={styles.walletTitle}>Connect wallet to sign</Text>
              <Text style={styles.walletText}>Your wallet signature links this proof to the scout who submitted it.</Text>
              <WalletUiConnectButton connect={wallet.connect} size="lg">Connect Wallet</WalletUiConnectButton>
            </View>
          )}

          <Pressable onPress={() => { setProof(null); setSignature(null) }} style={styles.secondaryButton}>
            <Ionicons color="#A0A0A5" name="refresh" size={17} />
            <Text style={styles.secondaryButtonText}>Retake photo</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} onCameraReady={() => setCameraReady(true)} />
      <View style={styles.cameraShade} pointerEvents="none" />

      <View style={[styles.cameraUi, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.topBarCamera}>
          <Pressable onPress={() => router.back()} style={styles.cameraIconButton}><Ionicons color="#FFFFFF" name="close" size={22} /></Pressable>
          <View style={styles.securePill}><Ionicons color="#FF7A18" name="shield-checkmark" size={14} /><Text style={styles.secureText}>LIVE PROOF</Text></View>
          <Pressable onPress={() => setFacing((value) => (value === 'back' ? 'front' : 'back'))} style={styles.cameraIconButton}>
            <Ionicons color="#FFFFFF" name="camera-reverse" size={20} />
          </Pressable>
        </View>

        <View style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>CAPTURE CHALLENGE</Text>
          <Text style={styles.challengeText}>{challenge}</Text>
          <View style={styles.challengeMetaRow}><Ionicons color="#FF7A18" name="location" size={14} /><Text style={styles.challengeMeta}>{place} · inside {radius} m</Text></View>
        </View>

        <View style={styles.cameraBottom}>
          <Text style={styles.captureHint}>GPS will be checked again when you press the shutter.</Text>
          <Pressable onPress={() => void captureLiveProof()} disabled={!cameraReady || capturing} style={styles.shutterOuter}>
            <View style={styles.shutterInner}>
              {capturing ? <ActivityIndicator color="#0A0A0B" /> : <Ionicons color="#0A0A0B" name="camera" size={24} />}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function MetaRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIcon}><Ionicons color="#FF6A00" name={icon} size={16} /></View>
      <View style={styles.metaCopy}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue} numberOfLines={1}>{value}</Text></View>
      <Ionicons color="#63D77A" name="checkmark-circle" size={17} />
    </View>
  )
}

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080809' },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080809' },
  permissionScreen: { flex: 1, backgroundColor: '#0A0A0B', paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  permissionIcon: { width: 74, height: 74, borderRadius: 26, backgroundColor: '#24150D', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  permissionTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', letterSpacing: -0.6 },
  permissionText: { color: '#77777C', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 9, marginBottom: 24, maxWidth: 310 },
  permissionButton: { height: 56, width: '100%', borderRadius: 19, backgroundColor: '#FF6A00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  permissionButtonText: { color: '#0A0A0B', fontSize: 13, fontWeight: '900' },
  backTextButton: { padding: 16 },
  backText: { color: '#6D6D72', fontSize: 11, fontWeight: '700' },
  cameraShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.12)' },
  cameraUi: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 18 },
  topBarCamera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cameraIconButton: { width: 44, height: 44, borderRadius: 17, backgroundColor: 'rgba(12,12,13,0.78)', alignItems: 'center', justifyContent: 'center' },
  securePill: { height: 38, borderRadius: 15, backgroundColor: 'rgba(12,12,13,0.8)', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  secureText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  challengeCard: { alignSelf: 'stretch', backgroundColor: 'rgba(10,10,11,0.84)', borderRadius: 23, padding: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  challengeLabel: { color: '#FF7A18', fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  challengeText: { color: '#FFFFFF', fontSize: 16, lineHeight: 21, fontWeight: '800', maxWidth: 300 },
  challengeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  challengeMeta: { color: '#A2A2A7', fontSize: 10 },
  cameraBottom: { alignItems: 'center' },
  captureHint: { color: 'rgba(255,255,255,0.72)', fontSize: 10, textAlign: 'center', marginBottom: 14 },
  shutterOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.22)' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center' },
  reviewContent: { flex: 1, paddingHorizontal: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  topTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center' },
  iconButtonGhost: { width: 40, height: 40 },
  reviewImageWrap: { flex: 1, minHeight: 240, maxHeight: 350, borderRadius: 28, overflow: 'hidden', backgroundColor: '#151517', marginBottom: 12 },
  reviewImage: { width: '100%', height: '100%' },
  liveBadge: { position: 'absolute', left: 14, top: 14, borderRadius: 13, backgroundColor: 'rgba(10,10,11,0.82)', paddingHorizontal: 10, height: 30, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6A00' },
  liveText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  metaCard: { borderRadius: 22, backgroundColor: '#131315', paddingHorizontal: 14, marginBottom: 12 },
  metaRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#202023' },
  metaIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#25160E', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  metaCopy: { flex: 1 },
  metaLabel: { color: '#69696E', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  metaValue: { color: '#E7E7E9', fontSize: 10, fontWeight: '700', marginTop: 3, maxWidth: 220 },
  primaryButton: { height: 54, borderRadius: 19, backgroundColor: '#FF6A00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 10 },
  submitButton: { backgroundColor: '#FF7A18' },
  primaryButtonText: { color: '#0A0A0B', fontSize: 13, fontWeight: '900' },
  secondaryButton: { height: 44, borderRadius: 16, backgroundColor: '#161618', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 9 },
  secondaryButtonText: { color: '#A0A0A5', fontSize: 11, fontWeight: '800' },
  walletCard: { borderRadius: 20, backgroundColor: '#141416', padding: 14, gap: 10 },
  walletTitle: { color: '#F4F4F5', fontSize: 12, fontWeight: '800' },
  walletText: { color: '#6F6F74', fontSize: 10, lineHeight: 15 },
  signedCard: { minHeight: 74, borderRadius: 21, backgroundColor: '#FF6A00', padding: 14, flexDirection: 'row', alignItems: 'center' },
  signedIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFB173', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  signedCopy: { flex: 1 },
  signedTitle: { color: '#0A0A0B', fontSize: 12, fontWeight: '900' },
  signedText: { color: '#3D210D', fontSize: 9, fontWeight: '700', marginTop: 4 },
  signatureText: { color: '#67310B', fontSize: 8, marginTop: 3 },
})
