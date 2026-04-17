import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router } from 'expo-router'
import { propertyApi } from '../../api/property/propertyApi'

interface Field {
  key: string
  label: string
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'url'
  required?: boolean
  multiline?: boolean
}

const FIELDS: Field[] = [
  { key: 'name', label: 'ชื่อสถานที่ *', placeholder: 'เช่น หอพักสุขสบาย', required: true },
  { key: 'address', label: 'ที่อยู่ *', placeholder: 'เลขที่ ถนน แขวง เขต จังหวัด', required: true, multiline: true },
  { key: 'description', label: 'คำอธิบาย', placeholder: 'รายละเอียดเพิ่มเติม', multiline: true },
  { key: 'googleMap', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...', keyboardType: 'url' },
]

const PRICE_FIELDS: Field[] = [
  { key: 'priceMin', label: 'ราคาต่ำสุด (บาท) *', placeholder: '3000', keyboardType: 'numeric', required: true },
  { key: 'priceMax', label: 'ราคาสูงสุด (บาท) *', placeholder: '5000', keyboardType: 'numeric', required: true },
]

const BANK_FIELDS: Field[] = [
  { key: 'bankName', label: 'ธนาคาร *', placeholder: 'เช่น กสิกรไทย', required: true },
  { key: 'bankAccount', label: 'เลขบัญชี *', placeholder: '000-0-00000-0', keyboardType: 'numeric', required: true },
  { key: 'bankHolder', label: 'ชื่อบัญชี *', placeholder: 'ชื่อ-นามสกุล', required: true },
]

export default function PropertyCreateScreen() {
  const [form, setForm] = useState<Record<string, string>>({
    name: '', address: '', description: '', googleMap: '',
    priceMin: '', priceMax: '',
    bankName: '', bankAccount: '', bankHolder: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อและที่อยู่')
      return
    }
    if (!form.priceMin || !form.priceMax) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกช่วงราคา')
      return
    }
    if (!form.bankName.trim() || !form.bankAccount.trim() || !form.bankHolder.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลธนาคารให้ครบ')
      return
    }

    setLoading(true)
    try {
      const property = await propertyApi.create({
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim() || undefined,
        googleMap: form.googleMap.trim() || undefined,
        priceMin: Number(form.priceMin),
        priceMax: Number(form.priceMax),
        bankName: form.bankName.trim(),
        bankAccount: form.bankAccount.trim(),
        bankHolder: form.bankHolder.trim(),
      })
      Alert.alert('สำเร็จ', `เพิ่ม "${property.name}" แล้ว`, [
        { text: 'ตกลง', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.error ?? 'ไม่สามารถเพิ่มสถานที่ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เพิ่มสถานที่ใหม่</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ข้อมูลทั่วไป */}
        <SectionTitle>ข้อมูลทั่วไป</SectionTitle>
        <View style={styles.card}>
          {FIELDS.map(f => (
            <FieldInput
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={v => set(f.key, v)}
            />
          ))}
        </View>

        {/* ราคา */}
        <SectionTitle>ราคา</SectionTitle>
        <View style={styles.card}>
          <View style={styles.row}>
            {PRICE_FIELDS.map(f => (
              <View key={f.key} style={styles.halfField}>
                <FieldInput field={f} value={form[f.key]} onChange={v => set(f.key, v)} />
              </View>
            ))}
          </View>
        </View>

        {/* ธนาคาร */}
        <SectionTitle>ข้อมูลรับชำระเงิน</SectionTitle>
        <View style={styles.card}>
          {BANK_FIELDS.map(f => (
            <FieldInput
              key={f.key}
              field={f}
              value={form[f.key]}
              onChange={v => set(f.key, v)}
            />
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>บันทึกสถานที่</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function FieldInput({ field, value, onChange }: {
  field: Field; value: string; onChange: (v: string) => void
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput
        style={[styles.input, field.multiline && styles.inputMulti]}
        placeholder={field.placeholder}
        placeholderTextColor="#C4C4C4"
        value={value}
        onChangeText={onChange}
        keyboardType={field.keyboardType ?? 'default'}
        multiline={field.multiline}
        numberOfLines={field.multiline ? 3 : 1}
        autoCapitalize="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#7C5CFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F5',
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F5F5FA', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#7C5CFC', marginTop: 8, marginBottom: 4, marginLeft: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#F0F0F5' },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  fieldWrap: { gap: 4 },
  label: { fontSize: 12, fontWeight: '500', color: '#555' },
  input: {
    borderWidth: 1, borderColor: '#E5E5EF', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#111', backgroundColor: '#FAFAFA',
  },
  inputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  submitBtn: {
    marginTop: 16, backgroundColor: '#7C5CFC', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
