import Ionicons from '@expo/vector-icons/Ionicons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppCluster } from '@/features/cluster/data-access/cluster-provider'
import { WalletUiConnectButton } from '@/features/wallet/ui/wallet-ui-connect-button'
import { executeWalletSignAndSendTransaction } from '@/features/wallet/util/execute-wallet-sign-and-send-transaction'

export default function ReviewSubmissionScreen() {
  const insets = useSafeAreaInsets()
  const wallet = useMobileWallet()
  const { client, cluster } = useAppCluster()
  const params = useLocalSearchParams<{
    mission?: string
    place?: string
    reward?: string
    challenge?: string
    photoUri?: string
    capturedAt?: string
    latitude?: string
    longitude?: string
    accuracy?: string
    distance?: string
    scout?: string
    proofSignature?: string
  }>()

  const [approving, setApproving] = useState(false)
  const [approvalSignature, setApprovalSignature] = useState<string | null>(null)
  const [rejected, setRejected] = useState(false)

  const mission = params.mission || 'Is the Web3 meetup live?'
  const place = params.place || 'Bodija, Ibadan'
  const reward = params.reward || '3'
  const scout = params.scout || 'Unknown scout'
  const capturedAt = params.capturedAt ? new Date(params.capturedAt) : null
  const walletAddress = wallet.account?.address.toString()

  async function approveProof() {
    if (!wallet.account || approving || approvalSignature) return

    setApproving(true)
    try {
      const memo = [
        'CROWDLENS_APPROVAL_V1',
        `mission=${mission}`,
        `place=${place}`,
        `scout=${scout}`,
        `proofSignature=${params.proofSignature || 'missing'}`,
        `reward=${reward} test USDC`,
        'status=approved',
        `approvedAt=${new Date().toISOString()}`,
      ].join('\n')

      const txSignature = await executeWalletSignAndSendTransaction({
        account: wallet.account,
        client,
        text: memo,
        getTransactionSigner: wallet.getTransactionSigner,
      })

      setApprovalSignature(txSignature)
      setRejected(false)
    } catch (error) {
      Alert.alert('Could not record approval', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setApproving(false)
    }
  }

  function rejectProof() {
    if (approvalSignature) return
    setRejected(true)
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons color="#FFFFFF" name="chevron-back" size={20} />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.topKicker}>REQUESTER</Text>
            <Text style={styles.topTitle}>Review proof</Text>
          </View>
          <View style={styles.iconButtonGhost} />
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionOrb}><Ionicons color="#FF7A18" name="eye-outline" size={23} /></View>
          <Text style={styles.kicker}>PROOF RECEIVED</Text>
          <Text style={styles.missionTitle}>{mission}</Text>
          <View style={styles.missionFooter}>
            <View style={styles.placeRow}><Ionicons color="#5D2B0C" name="location" size={13} /><Text style={styles.missionPlace}>{place}</Text></View>
            <View style={styles.rewardPill}><Text style={styles.rewardText}>{reward} USDC</Text></View>
          </View>
        </View>

        {params.photoUri ? (
          <View style={styles.photoFrame}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: params.photoUri }} resizeMode="cover" style={styles.image} />
              <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE CAPTURE</Text></View>
              <View style={styles.verifiedBadge}><Ionicons color="#0A0A0B" name="shield-checkmark" size={14} /><Text style={styles.verifiedBadgeText}>VERIFIED</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}><Ionicons color="#FF6A00" name="image-outline" size={34} /><Text style={styles.placeholderText}>Proof image unavailable</Text></View>
        )}

        <View style={styles.metricRow}>
          <Metric icon="time-outline" label="Captured" value={capturedAt ? capturedAt.toLocaleTimeString() : 'Live'} />
          <Metric icon="navigate-outline" label="Distance" value={`${Math.round(Number(params.distance) || 0)} m`} />
          <Metric icon="locate-outline" label="Accuracy" value={`±${Math.round(Number(params.accuracy) || 0)} m`} />
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityIcon}><Ionicons color="#FF7A18" name="finger-print-outline" size={20} /></View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityLabel}>SCOUT SIGNATURE</Text>
            <Text style={styles.identityTitle}>{shorten(scout)}</Text>
            <Text style={styles.identityText}>Wallet-linked proof identity</Text>
          </View>
          <View style={styles.identityCheck}><Ionicons color="#0A0A0B" name="checkmark" size={15} /></View>
        </View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeTop}><Ionicons color="#FF7A18" name="camera-outline" size={18} /><Text style={styles.challengeLabel}>CAPTURE INSTRUCTION</Text></View>
          <Text style={styles.challengeText}>{params.challenge || 'Capture fresh visual proof from the mission location.'}</Text>
        </View>

        {approvalSignature ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons color="#FF7A18" name="checkmark" size={24} /></View>
            <View style={styles.successCopy}>
              <Text style={styles.successLabel}>RECORDED ON {cluster.id.toUpperCase()}</Text>
              <Text style={styles.successTitle}>Proof approved</Text>
              <Text style={styles.successText}>The demo reward is marked released.</Text>
              <Text style={styles.txText} numberOfLines={1}>{approvalSignature}</Text>
            </View>
          </View>
        ) : rejected ? (
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedIcon}><Ionicons color="#FF8D7D" name="close" size={20} /></View>
            <View style={styles.rejectedCopy}><Text style={styles.rejectedTitle}>Proof rejected</Text><Text style={styles.rejectedText}>The reward remains unreleased.</Text></View>
          </View>
        ) : walletAddress ? (
          <View style={styles.actionShell}>
            <View style={styles.actionHeading}>
              <Text style={styles.actionLabel}>YOUR DECISION</Text>
              <Text style={styles.actionTitle}>Does this proof satisfy the mission?</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={rejectProof} disabled={approving} style={styles.rejectButton}>
                <Ionicons color="#8F8F94" name="close" size={18} />
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>
              <Pressable onPress={() => void approveProof()} disabled={approving} style={styles.approveButton}>
                {approving ? <ActivityIndicator color="#0A0A0B" /> : <Ionicons color="#0A0A0B" name="checkmark" size={18} />}
                <Text style={styles.approveText}>{approving ? 'Recording…' : 'Approve'}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIcon}><Ionicons color="#FF7A18" name="wallet-outline" size={21} /></View>
              <View style={styles.walletCopy}>
                <Text style={styles.walletLabel}>REQUESTER IDENTITY</Text>
                <Text style={styles.walletTitle}>Connect wallet</Text>
                <Text style={styles.walletText}>Connect to approve or reject this proof on Solana Devnet.</Text>
              </View>
            </View>
            <WalletUiConnectButton connect={wallet.connect} size="lg">Connect Solana wallet</WalletUiConnectButton>
          </View>
        )}

        {(approvalSignature || rejected) && (
          <Pressable onPress={() => router.replace('/updates')} style={styles.finishButton}>
            <Text style={styles.finishText}>Finish mission</Text>
            <View style={styles.finishArrow}><Ionicons color="#FF7A18" name="arrow-forward" size={17} /></View>
          </Pressable>
        )}

        <Text style={styles.demoNote}>Hackathon build · approval receipt uses Solana Devnet · test reward accounting is simulated.</Text>
      </ScrollView>
    </View>
  )
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}><Ionicons color="#FF7A18" name={icon} size={15} /></View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

function shorten(value: string) {
  if (value.length < 14) return value
  return `${value.slice(0, 7)}…${value.slice(-5)}`
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080809' },
  content: { paddingHorizontal: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titleBlock: { alignItems: 'center' },
  topKicker: { color: '#FF7A18', fontSize: 7, fontWeight: '900', letterSpacing: 1.2, marginBottom: 3 },
  topTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  iconButton: { width: 44, height: 44, borderRadius: 17, backgroundColor: '#151517', borderWidth: 1, borderColor: '#252528', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  iconButtonGhost: { width: 44, height: 44 },
  missionCard: { borderRadius: 29, backgroundColor: '#F36B08', padding: 18, marginBottom: 12, elevation: 12, shadowColor: '#FF6500', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 9 } },
  missionOrb: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  kicker: { color: '#552508', fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  missionTitle: { color: '#111113', fontSize: 21, lineHeight: 26, fontWeight: '900', maxWidth: 300 },
  missionFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  missionPlace: { color: '#5B2A0C', fontSize: 10, fontWeight: '800' },
  rewardPill: { backgroundColor: '#111113', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  rewardText: { color: '#FF7A18', fontSize: 10, fontWeight: '900' },
  photoFrame: { borderRadius: 31, backgroundColor: '#F36B08', padding: 5, marginBottom: 12, elevation: 10, shadowColor: '#FF6A00', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  imageWrap: { height: 270, borderRadius: 27, overflow: 'hidden', backgroundColor: '#151517' },
  image: { width: '100%', height: '100%' },
  liveBadge: { position: 'absolute', top: 13, left: 13, backgroundColor: 'rgba(8,8,9,0.84)', borderRadius: 14, height: 32, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6A00' },
  liveText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  verifiedBadge: { position: 'absolute', right: 13, bottom: 13, height: 34, borderRadius: 14, backgroundColor: '#F36B08', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifiedBadgeText: { color: '#0A0A0B', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  imagePlaceholder: { height: 180, borderRadius: 24, backgroundColor: '#151517', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  placeholderText: { color: '#747478', fontSize: 10, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  metric: { flex: 1, minHeight: 96, borderRadius: 21, backgroundColor: '#131315', borderWidth: 1, borderColor: '#242427', padding: 11, justifyContent: 'space-between', elevation: 5, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 } },
  metricIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: '#25160E', alignItems: 'center', justifyContent: 'center' },
  metricLabel: { color: '#68686D', fontSize: 8, fontWeight: '800' },
  metricValue: { color: '#F2F2F3', fontSize: 12, fontWeight: '900' },
  identityCard: { minHeight: 76, borderRadius: 22, backgroundColor: '#131315', borderWidth: 1, borderColor: '#242427', padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  identityIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: '#25160E', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  identityCopy: { flex: 1 },
  identityLabel: { color: '#66666A', fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  identityTitle: { color: '#F1F1F2', fontSize: 11, fontWeight: '900', marginTop: 4 },
  identityText: { color: '#66666A', fontSize: 8, marginTop: 3 },
  identityCheck: { width: 30, height: 30, borderRadius: 12, backgroundColor: '#63D77A', alignItems: 'center', justifyContent: 'center' },
  challengeCard: { borderRadius: 23, backgroundColor: '#111113', borderWidth: 1, borderColor: '#2A211B', padding: 15, marginBottom: 12 },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  challengeLabel: { color: '#FF7A18', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  challengeText: { color: '#C8C8CB', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  actionShell: { borderRadius: 26, backgroundColor: '#111113', borderWidth: 1, borderColor: '#28282B', padding: 14, marginBottom: 10 },
  actionHeading: { marginBottom: 13 },
  actionLabel: { color: '#FF7A18', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  actionTitle: { color: '#FFFFFF', fontSize: 14, lineHeight: 19, fontWeight: '900', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectButton: { flex: 1, height: 54, borderRadius: 18, backgroundColor: '#171719', borderWidth: 1, borderColor: '#28282B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  rejectText: { color: '#A8A8AD', fontSize: 11, fontWeight: '900' },
  approveButton: { flex: 1.35, height: 54, borderRadius: 18, backgroundColor: '#F36B08', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, elevation: 7 },
  approveText: { color: '#0A0A0B', fontSize: 11, fontWeight: '900' },
  walletCard: { borderRadius: 26, backgroundColor: '#111113', borderWidth: 1, borderColor: '#28282B', padding: 14, gap: 14, marginBottom: 10, elevation: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 7 } },
  walletHeader: { flexDirection: 'row', alignItems: 'center' },
  walletIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  walletCopy: { flex: 1 },
  walletLabel: { color: '#FF7A18', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  walletTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginTop: 3 },
  walletText: { color: '#6E6E73', fontSize: 9, lineHeight: 14, marginTop: 4 },
  successCard: { borderRadius: 26, backgroundColor: '#F36B08', padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 10, shadowColor: '#FF6A00', shadowOpacity: 0.18, shadowRadius: 14 },
  successIcon: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  successCopy: { flex: 1 },
  successLabel: { color: '#5B2808', fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  successTitle: { color: '#0A0A0B', fontSize: 14, fontWeight: '900', marginTop: 3 },
  successText: { color: '#512508', fontSize: 9, marginTop: 4 },
  txText: { color: '#6B3008', fontSize: 8, marginTop: 5 },
  rejectedCard: { borderRadius: 24, backgroundColor: '#241615', borderWidth: 1, borderColor: '#412321', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 },
  rejectedIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#321C1A', alignItems: 'center', justifyContent: 'center' },
  rejectedCopy: { flex: 1 },
  rejectedTitle: { color: '#FF9A8B', fontSize: 12, fontWeight: '900' },
  rejectedText: { color: '#9E6A64', fontSize: 9, marginTop: 4 },
  finishButton: { minHeight: 58, borderRadius: 21, backgroundColor: '#F36B08', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 19, paddingRight: 7, marginTop: 8, elevation: 8 },
  finishText: { color: '#0A0A0B', fontSize: 12, fontWeight: '900' },
  finishArrow: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center' },
  demoNote: { color: '#4F4F53', fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 14, paddingHorizontal: 16 },
})
