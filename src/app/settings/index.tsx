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
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>SCOUT PROFILE</Text>
        <Text style={styles.title}>Your CrowdLens</Text>
        <Text style={styles.subtitle}>Wallet identity, trust signals and mission history.</Text>

        <View style={styles.identityCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>FO</Text></View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>Faith Oluwalana</Text>
            <Text style={styles.role}>CrowdLens Scout</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Ionicons color="#FF6A13" name="shield-checkmark" size={14} />
            <Text style={styles.scoreText}>92</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value="12" label="Completed" />
          <Stat value="96%" label="Approved" />
          <Stat value="$18.40" label="Earned" accent />
        </View>

        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <Ionicons color="#FF6A13" name="wallet-outline" size={20} />
            </View>
            <View style={styles.walletCopy}>
              <Text style={styles.walletTitle}>{address ? 'Wallet connected' : 'Connect your wallet'}</Text>
              <Text style={styles.walletText} numberOfLines={1}>
                {address ?? 'Required to accept rewards and sign proof submissions.'}
              </Text>
            </View>
          </View>

          {!address ? (
            <WalletUiConnectButton connect={wallet.connect} size="lg">
              Connect Wallet
            </WalletUiConnectButton>
          ) : (
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>Connected on Solana</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Trust layer</Text>
        <View style={styles.trustCard}>
          <Ionicons color="#FF6A13" name="location-outline" size={20} />
          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Proof of Presence</Text>
            <Text style={styles.trustText}>Location, capture time and wallet signature will be attached to qualifying submissions.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && styles.accent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  eyebrow: { color: '#FF5A00', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#777777', fontSize: 14, lineHeight: 20, marginTop: 8 },
  identityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderWidth: 1, borderColor: '#222222', borderRadius: 22, padding: 16, marginTop: 26 },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#21130C', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  avatarText: { color: '#FF6A13', fontSize: 16, fontWeight: '900' },
  identityCopy: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  role: { color: '#6E6E6E', fontSize: 11 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#21130C', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  scoreText: { color: '#FF6A13', fontSize: 11, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: 12, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: '#111111', borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginBottom: 4 },
  accent: { color: '#FF6A13' },
  statLabel: { color: '#646464', fontSize: 9 },
  sectionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 12 },
  walletCard: { backgroundColor: '#131313', borderWidth: 1, borderColor: '#242424', borderRadius: 20, padding: 16, marginBottom: 26, gap: 16 },
  walletHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#21130C', alignItems: 'center', justifyContent: 'center' },
  walletCopy: { flex: 1 },
  walletTitle: { color: '#EEEEEE', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  walletText: { color: '#686868', fontSize: 10, lineHeight: 15 },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', backgroundColor: '#151C15', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  connectedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5CCB70' },
  connectedText: { color: '#88C991', fontSize: 10, fontWeight: '800' },
  trustCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: '#121212', borderRadius: 18, padding: 16 },
  trustCopy: { flex: 1 },
  trustTitle: { color: '#ECECEC', fontSize: 13, fontWeight: '800', marginBottom: 5 },
  trustText: { color: '#696969', fontSize: 11, lineHeight: 17 },
})
