import Ionicons from '@expo/vector-icons/Ionicons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WalletUiConnectButton } from '@/features/wallet/ui/wallet-ui-connect-button'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const wallet = useMobileWallet()
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
