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
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your scout identity.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>FO</Text>
          </View>
        </View>

        <View style={styles.identityCard}>
          <View>
            <Text style={styles.name}>Faith Oluwalana</Text>
            <Text style={styles.role}>CrowdLens Scout</Text>
          </View>
          <View style={styles.score}>
            <Ionicons color="#FF6413" name="shield-checkmark" size={14} />
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
            <View style={styles.walletIcon}>
              <Ionicons color="#FF6413" name="wallet-outline" size={19} />
            </View>
            <View style={styles.walletCopy}>
              <Text style={styles.walletTitle}>{address ? 'Connected' : 'Connect wallet'}</Text>
              <Text numberOfLines={1} style={styles.walletText}>
                {address ?? 'Needed for rewards and signatures.'}
              </Text>
            </View>
          </View>

          {!address ? (
            <WalletUiConnectButton connect={wallet.connect} size="lg">
              Connect Wallet
            </WalletUiConnectButton>
          ) : (
            <View style={styles.connectedRow}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Solana connected</Text>
            </View>
          )}
        </View>

        <View style={styles.simpleRow}>
          <View style={styles.simpleIcon}>
            <Ionicons color="#FF6413" name="location-outline" size={18} />
          </View>
          <View style={styles.simpleCopy}>
            <Text style={styles.simpleTitle}>Proof of Presence</Text>
            <Text style={styles.simpleText}>Location + live capture + wallet signature</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && styles.statAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0C' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#707070', fontSize: 12, marginTop: 5 },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#25170F', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FF6413', fontSize: 12, fontWeight: '800' },
  identityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151517', borderRadius: 20, padding: 17 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  role: { color: '#666666', fontSize: 10, marginTop: 4 },
  score: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#2A190F', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  scoreText: { color: '#FF6413', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: 10, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: '#141416', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  statAccent: { color: '#FF6413' },
  statLabel: { color: '#606060', fontSize: 9, marginTop: 4 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  walletCard: { backgroundColor: '#151517', borderRadius: 20, padding: 15, gap: 14, marginBottom: 14 },
  walletTop: { flexDirection: 'row', alignItems: 'center' },
  walletIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#2A190F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  walletCopy: { flex: 1 },
  walletTitle: { color: '#F0F0F0', fontSize: 12, fontWeight: '700' },
  walletText: { color: '#666666', fontSize: 10, marginTop: 4 },
  connectedRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64C875' },
  connectedText: { color: '#7EB988', fontSize: 10, fontWeight: '700' },
  simpleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141416', borderRadius: 18, padding: 15 },
  simpleIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#20160F', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  simpleCopy: { flex: 1 },
  simpleTitle: { color: '#EAEAEA', fontSize: 12, fontWeight: '700' },
  simpleText: { color: '#626262', fontSize: 9, marginTop: 4 },
})
