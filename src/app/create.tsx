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
      Alert.alert('Add the basics', 'Mission, location and reward are required.')
      return
    }

    Alert.alert('Mission ready', `${question}\n${location} · ${radius}\n${reward} test USDC`)
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create mission</Text>
        <Text style={styles.subtitle}>Ask one clear question. Get fresh proof.</Text>

        <Text style={styles.label}>Mission</Text>
        <TextInput
          multiline
          onChangeText={setQuestion}
          placeholder="Is the event happening right now?"
          placeholderTextColor="#595959"
          style={[styles.input, styles.textArea]}
          value={question}
        />

        <Text style={styles.label}>Location</Text>
        <View style={styles.inputRow}>
          <Ionicons color="#F26922" name="location-outline" size={19} />
          <TextInput
            onChangeText={setLocation}
            placeholder="Search a place"
            placeholderTextColor="#595959"
            style={styles.rowInput}
            value={location}
          />
        </View>

        <View style={styles.radiusHeader}>
          <Text style={styles.labelNoMargin}>Radius</Text>
          <Text style={styles.hint}>Scout must be inside this area</Text>
        </View>
        <View style={styles.radiusRow}>
          {['25 m', '50 m', '100 m'].map((item) => (
            <Pressable key={item} onPress={() => setRadius(item)} style={[styles.radius, radius === item && styles.radiusActive]}>
              <Text style={[styles.radiusText, radius === item && styles.radiusTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Proof</Text>
        <View style={styles.proofCard}>
          <View style={styles.proofIcon}>
            <Ionicons color="#FF6413" name="camera-outline" size={20} />
          </View>
          <View style={styles.proofCopy}>
            <Text style={styles.proofTitle}>Live photo + GPS</Text>
            <Text style={styles.proofText}>Captured inside CrowdLens.</Text>
          </View>
          <Ionicons color="#FF6413" name="checkmark-circle" size={20} />
        </View>

        <Text style={styles.label}>Reward</Text>
        <View style={styles.inputRow}>
          <Text style={styles.token}>USDC</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setReward}
            placeholder="3.00"
            placeholderTextColor="#595959"
            style={styles.rowInput}
            value={reward}
          />
          <Text style={styles.devnet}>DEVNET</Text>
        </View>

        <Pressable onPress={previewMission} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons color="#FFFFFF" name="arrow-forward" size={17} />
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B0C' },
  content: { paddingHorizontal: 20, paddingBottom: 34 },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#707070', fontSize: 12, marginTop: 5, marginBottom: 28 },
  label: { color: '#DADADA', fontSize: 12, fontWeight: '700', marginBottom: 9, marginTop: 18 },
  labelNoMargin: { color: '#DADADA', fontSize: 12, fontWeight: '700' },
  input: { backgroundColor: '#151517', borderRadius: 17, color: '#FFFFFF', fontSize: 14, paddingHorizontal: 15, paddingVertical: 14 },
  textArea: { minHeight: 92, textAlignVertical: 'top' },
  inputRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#151517', borderRadius: 17, paddingHorizontal: 15 },
  rowInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  radiusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 9 },
  hint: { color: '#555555', fontSize: 9 },
  radiusRow: { flexDirection: 'row', gap: 8 },
  radius: { flex: 1, backgroundColor: '#151517', borderRadius: 13, paddingVertical: 11, alignItems: 'center' },
  radiusActive: { backgroundColor: '#F05A0A' },
  radiusText: { color: '#747474', fontSize: 11, fontWeight: '700' },
  radiusTextActive: { color: '#FFFFFF' },
  proofCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151517', borderRadius: 17, padding: 14 },
  proofIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#2A190F', alignItems: 'center', justifyContent: 'center' },
  proofCopy: { flex: 1, marginLeft: 11 },
  proofTitle: { color: '#F2F2F2', fontSize: 12, fontWeight: '700' },
  proofText: { color: '#666666', fontSize: 10, marginTop: 3 },
  token: { color: '#E3E3E3', fontSize: 10, fontWeight: '800' },
  devnet: { color: '#F26922', fontSize: 9, fontWeight: '800' },
  button: { height: 54, borderRadius: 17, backgroundColor: '#F05A0A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
})
