import Ionicons from '@expo/vector-icons/Ionicons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStore } from '@nanostores/react'
import { useState } from 'react'
import { $nativeSession, nativeCloud, refreshNativeSharedMissions, setNativeSession, signOutNativeCloud } from '@/features/cloud/native-cloud'

import { WalletUiConnectButton } from '@/features/wallet/ui/wallet-ui-connect-button'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const wallet = useMobileWallet()
  const cloudSession = useStore($nativeSession)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [cloudWorking, setCloudWorking] = useState(false)
  const [cloudStatus, setCloudStatus] = useState('')

  async function sendCode() {
    if (!nativeCloud || cloudWorking) return
    setCloudWorking(true); setCloudStatus('')
    try {
      await nativeCloud.requestEmailCode(email.trim())
      setCodeSent(true)
      setCloudStatus('Check your email for a CrowdLens verification code.')
    } catch (error) { setCloudStatus(error instanceof Error ? error.message : 'Could not send the code.') }
    finally { setCloudWorking(false) }
  }

  async function verifyCode() {
    if (!nativeCloud || cloudWorking) return
    setCloudWorking(true); setCloudStatus('')
    try {
      const session = await nativeCloud.verifyEmailCode(email.trim(), code.trim())
      setNativeSession(session)
      const count = await refreshNativeSharedMissions()
      setCloudStatus('Signed in. ' + count + ' shared missions loaded.')
    } catch (error) { setCloudStatus(error instanceof Error ? error.message : 'Could not verify the code.') }
    finally { setCloudWorking(false) }
  }

  const address = wallet.account?.address.toString()

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>SCOUT</Text>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.orangeIdentity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>FO</Text></View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>Faith Oluwalana</Text>
            <Text style={styles.role}>CrowdLens Scout</Text>
          </View>
          <View style={styles.scoreOrb}>
            <Ionicons color="#FF7A18" name="shield-checkmark" size={17} />
            <Text style={styles.scoreText}>92</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value="12" label="Done" />
          <Stat value="96%" label="Approved" />
          <Stat value="$18" label="Earned" accent />
        </View>

        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View style={styles.walletIcon}><Ionicons color="#FF7A18" name="wallet-outline" size={21} /></View>
            <View style={styles.walletCopy}>
              <Text style={styles.walletTitle}>{address ? 'Connected' : 'Connect wallet'}</Text>
              <Text numberOfLines={1} style={styles.walletText}>{address ?? 'Needed for rewards and proof signatures.'}</Text>
            </View>
          </View>

          {!address ? (
            <WalletUiConnectButton connect={wallet.connect} size="lg">Connect Wallet</WalletUiConnectButton>
          ) : (
            <View style={styles.connectedRow}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Solana connected</Text>
            </View>
          )}
        </View>

        <View style={styles.cloudCard}>
          <Text style={styles.cloudTitle}>CrowdLens account</Text>
          {!nativeCloud ? (
            <Text style={styles.cloudHint}>Cloud access is not configured in this APK build. Set the public Supabase environment variables and rebuild.</Text>
          ) : cloudSession ? (
            <>
              <Text style={styles.cloudConnected}>Signed in · Shared missions enabled</Text>
              <View style={styles.cloudActions}>
                <Pressable onPress={() => { setCloudWorking(true); void refreshNativeSharedMissions().then((count) => setCloudStatus(count + ' shared missions loaded.')).catch((error: unknown) => setCloudStatus(error instanceof Error ? error.message : 'Refresh failed.')).finally(() => setCloudWorking(false)) }} disabled={cloudWorking} style={styles.cloudSecondary}><Text style={styles.cloudSecondaryText}>Refresh missions</Text></Pressable>
                <Pressable onPress={() => { setCloudWorking(true); void signOutNativeCloud().then(() => { setCodeSent(false); setCode(''); setCloudStatus('Signed out.') }).finally(() => setCloudWorking(false)) }} disabled={cloudWorking} style={styles.cloudSecondary}><Text style={styles.cloudSecondaryText}>Sign out</Text></Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cloudHint}>Sign in with an email verification code to access missions on both Android and the website.</Text>
              <TextInput style={styles.cloudInput} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="Email address" placeholderTextColor="#77777D" value={email} onChangeText={setEmail} />
              {codeSent && <TextInput style={styles.cloudInput} keyboardType="number-pad" placeholder="Six-digit verification code" placeholderTextColor="#77777D" value={code} onChangeText={setCode} />}
              <Pressable disabled={cloudWorking || (codeSent ? !code.trim() : !email.includes('@'))} style={styles.cloudPrimary} onPress={() => void (codeSent ? verifyCode() : sendCode())}>
                {cloudWorking ? <ActivityIndicator color="#111" /> : <Text style={styles.cloudPrimaryText}>{codeSent ? 'Verify code' : 'Send verification code'}</Text>}
              </Pressable>
              {codeSent && <Pressable onPress={() => { setCodeSent(false); setCode(''); setCloudStatus('') }} style={styles.cloudChange}><Text style={styles.cloudChangeText}>Change email</Text></Pressable>}
            </>
          )}
          {cloudStatus ? <Text style={styles.cloudHint}>{cloudStatus}</Text> : null}
        </View>

        <View style={styles.proofCard}>
          <View style={styles.proofIcon}><Ionicons color="#111111" name="location-outline" size={19} /></View>
          <View style={styles.proofCopy}>
            <Text style={styles.proofTitle}>Proof of Presence</Text>
            <Text style={styles.proofText}>Location + live capture + wallet signature</Text>
          </View>
          <Ionicons color="#6F6F73" name="chevron-forward" size={17} />
        </View>
      </ScrollView>
    </View>
  )
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && styles.statAccentCard]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cloudCard: { backgroundColor: '#151517', borderColor: '#29292E', borderWidth: 1, borderRadius: 23, padding: 17, gap: 12, marginBottom: 15 },
  cloudTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  cloudHint: { color: '#A4A4AB', fontSize: 11, lineHeight: 17 },
  cloudConnected: { color: '#8DDBA0', fontSize: 12, fontWeight: '700' },
  cloudInput: { minHeight: 46, borderRadius: 13, backgroundColor: '#0E0E10', borderColor: '#45454C', borderWidth: 1, color: '#FFFFFF', paddingHorizontal: 13, fontSize: 13 },
  cloudPrimary: { minHeight: 47, backgroundColor: '#F36B08', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cloudPrimaryText: { color: '#101010', fontWeight: '900', fontSize: 12 },
  cloudChange: { paddingVertical: 5, alignSelf: 'center' },
  cloudChangeText: { color: '#FF943F', fontWeight: '700', fontSize: 12 },
  cloudActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  cloudSecondary: { paddingHorizontal: 13, paddingVertical: 13, borderRadius: 12, backgroundColor: '#29292D' },
  cloudSecondaryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  screen: { flex: 1, backgroundColor: '#0C0C0D' },
  content: { paddingHorizontal: 18, paddingBottom: 30 },
  kicker: { color: '#FF7A18', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.9, marginBottom: 18 },
  orangeIdentity: { minHeight: 94, backgroundColor: '#F36B08', borderRadius: 28, padding: 15, flexDirection: 'row', alignItems: 'center', elevation: 12, shadowColor: '#FF6A00', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 9 } },
  avatar: { width: 58, height: 58, borderRadius: 21, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#FF7A18', fontSize: 15, fontWeight: '900' },
  identityCopy: { flex: 1 },
  name: { color: '#111111', fontSize: 16, fontWeight: '900' },
  role: { color: 'rgba(0,0,0,0.56)', fontSize: 10, fontWeight: '700', marginTop: 4 },
  scoreOrb: { width: 52, height: 52, borderRadius: 19, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center' },
  scoreText: { color: '#FF7A18', fontSize: 9, fontWeight: '900', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 25 },
  stat: { flex: 1, minHeight: 72, borderRadius: 21, backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 9, shadowOffset: { width: 0, height: 5 } },
  statAccentCard: { backgroundColor: '#F36B08', borderColor: '#F36B08' },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  statValueAccent: { color: '#111111' },
  statLabel: { color: '#66666A', fontSize: 8, marginTop: 4, fontWeight: '700' },
  statLabelAccent: { color: 'rgba(0,0,0,0.58)' },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  walletCard: { backgroundColor: '#151517', borderRadius: 24, borderWidth: 1, borderColor: '#242427', padding: 14, gap: 15, marginBottom: 12, elevation: 7, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  walletTop: { flexDirection: 'row', alignItems: 'center' },
  walletIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  walletCopy: { flex: 1 },
  walletTitle: { color: '#F0F0F0', fontSize: 12, fontWeight: '800' },
  walletText: { color: '#66666A', fontSize: 9, marginTop: 4 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  connectedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#63C978' },
  connectedText: { color: '#83BD8E', fontSize: 10, fontWeight: '800' },
  proofCard: { minHeight: 70, borderRadius: 22, backgroundColor: '#151517', borderWidth: 1, borderColor: '#242427', flexDirection: 'row', alignItems: 'center', padding: 11 },
  proofIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: '#F36B08', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  proofCopy: { flex: 1 },
  proofTitle: { color: '#F0F0F0', fontSize: 12, fontWeight: '800' },
  proofText: { color: '#66666A', fontSize: 9, marginTop: 4 },
})
