import Ionicons from '@expo/vector-icons/Ionicons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
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
        `status=approved`,
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
      console.error(error)
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
          <Text style={styles.topTitle}>Requester review</Text>
          <View style={styles.iconButtonGhost} />
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.kicker}>PROOF RECEIVED</Text>
          <Text style={styles.missionTitle}>{mission}</Text>
          <View style={styles.missionFooter}>
            <Text style={styles.missionPlace}>{place}</Text>
            <View style={styles.rewardPill}><Text style={styles.rewardText}>{reward} USDC</Text></View>
          </View>
        </View>

        {params.photoUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: params.photoUri }} resizeMode="cover" style={styles.image} />
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE CAPTURE</Text></View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}><Ionicons color="#FF6A00" name="image-outline" size={34} /><Text style={styles.placeholderText}>Proof image unavailable</Text></View>
        )}

        <View style={styles.checkCard}>
          <CheckRow label="Captured in CrowdLens" detail={capturedAt ? capturedAt.toLocaleString() : 'Live capture'} />
          <CheckRow label="Inside mission zone" detail={`${Math.round(Number(params.distance) || 0)} m from mission point`} />
          <CheckRow label="GPS accuracy" detail={`±${Math.round(Number(params.accuracy) || 0)} m`} />
          <CheckRow label="Wallet signed" detail={shorten(scout)} />
        </View>

        <View style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>CAPTURE INSTRUCTION</Text>
          <Text style={styles.challengeText}>{params.challenge || 'Capture fresh visual proof from the mission location.'}</Text>
        </View>

        {approvalSignature ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons color="#0A0A0B" name="checkmark" size={24} /></View>
            <View style={styles.successCopy}>
              <Text style={styles.successTitle}>Approved on Solana</Text>
              <Text style={styles.successText}>Reward marked released for the demo on {cluster.id}.</Text>
              <Text style={styles.txText} numberOfLines={1}>{approvalSignature}</Text>
            </View>
          </View>
        ) : rejected ? (
          <View style={styles.rejectedCard}>
            <Ionicons color="#FF7E6D" name="close-circle" size={22} />
            <View style={styles.rejectedCopy}><Text style={styles.rejectedTitle}>Proof rejected</Text><Text style={styles.rejectedText}>The reward remains unreleased.</Text></View>
          </View>
        ) : walletAddress ? (
          <View style={styles.actions}>
            <Pressable onPress={rejectProof} disabled={approving} style={styles.rejectButton}>
              <Ionicons color="#A8A8AD" name="close" size={18} />
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable onPress={() => void approveProof()} disabled={approving} style={styles.approveButton}>
              {approving ? <ActivityIndicator color="#0A0A0B" /> : <Ionicons color="#0A0A0B" name="checkmark" size={18} />}
              <Text style={styles.approveText}>{approving ? 'Recording…' : 'Approve'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.walletCard}>
            <Text style={styles.walletTitle}>Requester wallet required</Text>
            <Text style={styles.walletText}>Connect a Solana wallet to record the approval receipt on-chain.</Text>
            <WalletUiConnectButton connect={wallet.connect} size="lg">Connect Wallet</WalletUiConnectButton>
          </View>
        )}

        {(approvalSignature || rejected) && (
          <Pressable onPress={() => router.replace('/updates')} style={styles.finishButton}>
            <Text style={styles.finishText}>Finish mission</Text>
            <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
          </Pressable>
        )}

        <Text style={styles.demoNote}>
          Hackathon demo: approval is written as a Solana transaction receipt. Test reward accounting is simulated until token escrow is connected.
        </Text>
      </ScrollView>
    </View>
  )
}

function CheckRow({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkIcon}><Ionicons color="#0A0A0B" name="checkmark" size={15} /></View>
      <View style={styles.checkCopy}><Text style={styles.checkLabel}>{label}</Text><Text style={styles.checkDetail} numberOfLines={1}>{detail}</Text></View>
    </View>
  )
}

function shorten(value: string) {
  if (value.length < 14) return value
  return `${value.slice(0, 7)}…${value.slice(-5)}`
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#09090A' },
  content: { paddingHorizontal: 18 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  topTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#171719', alignItems: 'center', justifyContent: 'center' },
  iconButtonGhost: { width: 40, height: 40 },
  missionCard: { borderRadius: 25, backgroundColor: '#F36B08', padding: 18, marginBottom: 12, elevation: 8, shadowColor: '#FF6500', shadowOpacity: 0.18, shadowRadius: 12 },
  kicker: { color: '#4A2108', fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  missionTitle: { color: '#111113', fontSize: 20, lineHeight: 25, fontWeight: '900', maxWidth: 290 },
  missionFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  missionPlace: { color: '#5B2A0C', fontSize: 10, fontWeight: '700' },
  rewardPill: { backgroundColor: '#111113', borderRadius: 13, paddingHorizontal: 11, paddingVertical: 7 },
  rewardText: { color: '#FF7A18', fontSize: 10, fontWeight: '900' },
  imageWrap: { height: 245, borderRadius: 26, overflow: 'hidden', backgroundColor: '#151517', marginBottom: 12 },
  image: { width: '100%', height: '100%' },
  liveBadge: { position: 'absolute', top: 13, left: 13, backgroundColor: 'rgba(8,8,9,0.82)', borderRadius: 12, height: 29, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6A00' },
  liveText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  imagePlaceholder: { height: 180, borderRadius: 24, backgroundColor: '#151517', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  placeholderText: { color: '#747478', fontSize: 10, fontWeight: '700' },
  checkCard: { backgroundColor: '#141416', borderRadius: 23, paddingHorizontal: 14, marginBottom: 12 },
  checkRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#202023' },
  checkIcon: { width: 30, height: 30, borderRadius: 11, backgroundColor: '#FF6A00', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkCopy: { flex: 1 },
  checkLabel: { color: '#ECECEE', fontSize: 11, fontWeight: '800' },
  checkDetail: { color: '#67676C', fontSize: 9, marginTop: 3 },
  challengeCard: { borderRadius: 20, backgroundColor: '#1B1511', padding: 15, marginBottom: 12 },
  challengeLabel: { color: '#FF7A18', fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  challengeText: { color: '#C8C8CB', fontSize: 11, lineHeight: 17, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  rejectButton: { flex: 1, height: 56, borderRadius: 19, backgroundColor: '#171719', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  rejectText: { color: '#A8A8AD', fontSize: 12, fontWeight: '800' },
  approveButton: { flex: 1.4, height: 56, borderRadius: 19, backgroundColor: '#FF6A00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  approveText: { color: '#0A0A0B', fontSize: 12, fontWeight: '900' },
  walletCard: { borderRadius: 22, backgroundColor: '#141416', padding: 15, gap: 10 },
  walletTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  walletText: { color: '#6E6E73', fontSize: 10, lineHeight: 16 },
  successCard: { borderRadius: 23, backgroundColor: '#FF6A00', padding: 15, flexDirection: 'row', alignItems: 'center' },
  successIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: '#FFB173', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  successCopy: { flex: 1 },
  successTitle: { color: '#0A0A0B', fontSize: 13, fontWeight: '900' },
  successText: { color: '#512508', fontSize: 9, marginTop: 4 },
  txText: { color: '#6B3008', fontSize: 8, marginTop: 5 },
  rejectedCard: { borderRadius: 22, backgroundColor: '#291817', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  rejectedCopy: { flex: 1 },
  rejectedTitle: { color: '#FF9A8B', fontSize: 12, fontWeight: '900' },
  rejectedText: { color: '#9E6A64', fontSize: 9, marginTop: 4 },
  finishButton: { height: 52, borderRadius: 18, backgroundColor: '#1A1A1D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  finishText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  demoNote: { color: '#4F4F53', fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 15, paddingHorizontal: 16 },
})
