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
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>NEW REQUEST</Text>
        <Text style={styles.title}>Create mission</Text>

        <View style={styles.orangeCard}>
          <Text style={styles.orangeTitle}>What do you need checked?</Text>
          <TextInput
            multiline
            onChangeText={setQuestion}
            placeholder="Is the event happening right now?"
            placeholderTextColor="rgba(0,0,0,0.42)"
            style={styles.orangeInput}
            value={question}
          />
        </View>

        <Text style={styles.label}>Location</Text>
        <View style={styles.field}>
          <View style={styles.fieldIcon}><Ionicons color="#FF7A18" name="location-outline" size={18} /></View>
          <TextInput onChangeText={setLocation} placeholder="Search a place" placeholderTextColor="#626266" style={styles.flexInput} value={location} />
        </View>

        <View style={styles.radiusHeader}>
          <Text style={styles.labelNoMargin}>Radius</Text>
          <Text style={styles.hint}>Scout must be inside</Text>
        </View>
        <View style={styles.segmentWrap}>
          {['25 m', '50 m', '100 m'].map((item) => (
            <Pressable key={item} onPress={() => setRadius(item)} style={[styles.segment, radius === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, radius === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Proof</Text>
        <View style={styles.proofCard}>
          <View style={styles.proofIcon}><Ionicons color="#FF7A18" name="camera-outline" size={21} /></View>
          <View style={styles.proofCopy}>
            <Text style={styles.proofTitle}>Live photo + GPS</Text>
            <Text style={styles.proofText}>Captured inside CrowdLens</Text>
          </View>
          <View style={styles.check}><Ionicons color="#111111" name="checkmark" size={15} /></View>
        </View>

        <Text style={styles.label}>Reward</Text>
        <View style={styles.field}>
          <View style={styles.tokenBadge}><Text style={styles.tokenText}>USDC</Text></View>
          <TextInput keyboardType="decimal-pad" onChangeText={setReward} placeholder="3.00" placeholderTextColor="#626266" style={styles.flexInput} value={reward} />
          <Text style={styles.devnet}>DEVNET</Text>
        </View>

        <Pressable onPress={previewMission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <View style={styles.arrowButton}><Ionicons color="#FF7A18" name="arrow-forward" size={17} /></View>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0C0C0D' },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  kicker: { color: '#FF7A18', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.9, marginBottom: 18 },
  orangeCard: { backgroundColor: '#F36B08', borderRadius: 28, padding: 18, marginBottom: 21, elevation: 12, shadowColor: '#FF6A00', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 9 } },
  orangeTitle: { color: '#161616', fontSize: 13, fontWeight: '900', marginBottom: 12 },
  orangeInput: { minHeight: 92, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', color: '#111111', fontSize: 14, fontWeight: '700', paddingHorizontal: 15, paddingVertical: 14, textAlignVertical: 'top' },
  label: { color: '#E0E0E0', fontSize: 11, fontWeight: '800', marginBottom: 9, marginTop: 17 },
  labelNoMargin: { color: '#E0E0E0', fontSize: 11, fontWeight: '800' },
  field: { minHeight: 56, borderRadius: 20, backgroundColor: '#151517', borderWidth: 1, borderColor: '#252528', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, elevation: 6, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  fieldIcon: { width: 40, height: 40, borderRadius: 15, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  flexInput: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  radiusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 9 },
  hint: { color: '#5D5D61', fontSize: 9 },
  segmentWrap: { flexDirection: 'row', backgroundColor: '#151517', borderRadius: 19, padding: 5, borderWidth: 1, borderColor: '#252528' },
  segment: { flex: 1, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#F36B08' },
  segmentText: { color: '#707074', fontSize: 10, fontWeight: '800' },
  segmentTextActive: { color: '#111111' },
  proofCard: { minHeight: 72, borderRadius: 22, backgroundColor: '#151517', borderWidth: 1, borderColor: '#252528', flexDirection: 'row', alignItems: 'center', padding: 11 },
  proofIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: '#24160F', alignItems: 'center', justifyContent: 'center' },
  proofCopy: { flex: 1, marginLeft: 11 },
  proofTitle: { color: '#F3F3F3', fontSize: 12, fontWeight: '800' },
  proofText: { color: '#66666A', fontSize: 9, marginTop: 4 },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F36B08', alignItems: 'center', justifyContent: 'center' },
  tokenBadge: { backgroundColor: '#202023', borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8 },
  tokenText: { color: '#F0F0F0', fontSize: 9, fontWeight: '900' },
  devnet: { color: '#FF7A18', fontSize: 8, fontWeight: '900', marginRight: 7 },
  primaryButton: { marginTop: 26, minHeight: 58, borderRadius: 21, backgroundColor: '#F36B08', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 21, paddingRight: 7, elevation: 10, shadowColor: '#FF6A00', shadowOpacity: 0.18, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  primaryButtonText: { color: '#111111', fontSize: 13, fontWeight: '900' },
  arrowButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#111113', alignItems: 'center', justifyContent: 'center' },
})
