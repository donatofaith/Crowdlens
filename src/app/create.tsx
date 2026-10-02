import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CreateMissionScreen() {
  const insets = useSafeAreaInsets()
  const [question, setQuestion] = useState('')
  const [location, setLocation] = useState('')
  const [reward, setReward] = useState('')
  const [radius, setRadius] = useState('50 m')

  function previewMission() {
    if (!question.trim() || !location.trim() || !reward.trim()) {
      Alert.alert('Almost there', 'Add the mission, location and reward first.')
      return
    }

    Alert.alert(
      'Mission draft ready',
      `${question}\n\nLocation: ${location}\nRadius: ${radius}\nReward: ${reward} test USDC`,
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>REQUEST PROOF</Text>
        <Text style={styles.title}>Create a mission</Text>
        <Text style={styles.subtitle}>Tell nearby scouts exactly what you need verified.</Text>

        <FieldLabel number="01" title="What do you need verified?" />
        <TextInput
          multiline
          onChangeText={setQuestion}
          placeholder="e.g. Is the Web3 event at this venue live right now?"
          placeholderTextColor="#515151"
          style={[styles.input, styles.textArea]}
          value={question}
        />

        <FieldLabel number="02" title="Where?" />
        <View style={styles.inputWithIcon}>
          <Ionicons color="#FF5A00" name="location-outline" size={19} />
          <TextInput
            onChangeText={setLocation}
            placeholder="Search or enter a location"
            placeholderTextColor="#515151"
            style={styles.flexInput}
            value={location}
          />
        </View>

        <Text style={styles.smallLabel}>Allowed verification radius</Text>
        <View style={styles.choiceRow}>
          {['25 m', '50 m', '100 m'].map((item) => (
            <Pressable key={item} onPress={() => setRadius(item)} style={[styles.choice, radius === item && styles.choiceActive]}>
              <Text style={[styles.choiceText, radius === item && styles.choiceTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <FieldLabel number="03" title="Proof required" />
        <View style={styles.proofCard}>
          <View style={styles.proofIcon}>
            <Ionicons color="#FF6A13" name="camera-outline" size={21} />
          </View>
          <View style={styles.proofCopy}>
            <Text style={styles.proofTitle}>Live photo + location</Text>
            <Text style={styles.proofText}>Scout must capture proof inside CrowdLens while inside the mission radius.</Text>
          </View>
          <Ionicons color="#FF6A13" name="checkmark-circle" size={22} />
        </View>

        <FieldLabel number="04" title="Reward" />
        <View style={styles.inputWithIcon}>
          <View style={styles.tokenBadge}><Text style={styles.tokenBadgeText}>USDC</Text></View>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setReward}
            placeholder="3.00"
            placeholderTextColor="#515151"
            style={styles.flexInput}
            value={reward}
          />
          <Text style={styles.devnet}>DEVNET</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons color="#727272" name="shield-checkmark-outline" size={18} />
          <Text style={styles.infoText}>For the hackathon, payments will use test tokens. No real money is required.</Text>
        </View>

        <Pressable onPress={previewMission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Preview mission</Text>
          <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
        </Pressable>
      </ScrollView>
    </View>
  )
}

function FieldLabel({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.fieldLabel}>
      <Text style={styles.fieldNumber}>{number}</Text>
      <Text style={styles.fieldTitle}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingHorizontal: 20, paddingBottom: 34 },
  eyebrow: { color: '#FF5A00', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#7A7A7A', fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 30 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 10 },
  fieldNumber: { color: '#FF5A00', fontSize: 10, fontWeight: '900' },
  fieldTitle: { color: '#EDEDED', fontSize: 14, fontWeight: '800' },
  input: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#242424', borderRadius: 18, color: '#FFFFFF', fontSize: 14, paddingHorizontal: 16, paddingVertical: 15 },
  textArea: { minHeight: 112, textAlignVertical: 'top' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#121212', borderWidth: 1, borderColor: '#242424', borderRadius: 18, paddingHorizontal: 15, minHeight: 56 },
  flexInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  smallLabel: { color: '#676767', fontSize: 11, marginTop: 12, marginBottom: 9 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#242424', borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9 },
  choiceActive: { borderColor: '#FF5A00', backgroundColor: '#21130C' },
  choiceText: { color: '#747474', fontSize: 11, fontWeight: '700' },
  choiceTextActive: { color: '#FF6A13' },
  proofCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#121212', borderWidth: 1, borderColor: '#2D211B', borderRadius: 20, padding: 15 },
  proofIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#24150E', alignItems: 'center', justifyContent: 'center' },
  proofCopy: { flex: 1 },
  proofTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  proofText: { color: '#6E6E6E', fontSize: 11, lineHeight: 16 },
  tokenBadge: { backgroundColor: '#1E1E1E', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 },
  tokenBadgeText: { color: '#E7E7E7', fontSize: 10, fontWeight: '900' },
  devnet: { color: '#FF6A13', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  infoCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#101010', borderRadius: 16, padding: 14, marginTop: 18 },
  infoText: { flex: 1, color: '#686868', fontSize: 11, lineHeight: 17 },
  primaryButton: { marginTop: 24, height: 56, borderRadius: 18, backgroundColor: '#FF5A00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
})
