import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { financeApi, type MyContractItem } from '../../api/finance/financeApi'
import { ContractStatusBadge } from './StatusBadges'

const MONTH_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function formatDate(iso: string) {
  const d = new Date(iso)
  const str = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  const [y, m, day] = str.split('-').map(Number)
  return `${day} ${MONTH_TH[m - 1]} ${y + 543}`
}

function ContractCard({ contract }: { contract: MyContractItem }) {
  const openPdf = async () => {
    if (!contract.pdfUrl) return
    try {
      const supported = await Linking.canOpenURL(contract.pdfUrl)
      if (supported) await Linking.openURL(contract.pdfUrl)
      else Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดไฟล์ PDF ได้')
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดไฟล์ PDF ได้')
    }
  }

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.headerProp}>{contract.propertyName}</Text>
          </View>
          <ContractStatusBadge status={contract.status} />
        </View>
        <Text style={s.headerTitle}>สัญญาเช่าห้องพัก</Text>
        <View style={s.headerSubRow}>
          <Ionicons name="home-outline" size={11} color="rgba(255,255,255,0.85)" />
          <Text style={s.headerSub}>ห้อง {contract.roomNumber}</Text>
          <Text style={s.headerSub}>·</Text>
          <Ionicons name="document-text-outline" size={11} color="rgba(255,255,255,0.85)" />
          <Text style={s.headerSub}>{contract.contractDuration}</Text>
        </View>
      </View>

      <View style={s.cardBody}>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="calendar-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>วันที่เริ่มสัญญา</Text>
          </View>
          <Text style={s.rowVal}>{formatDate(contract.startDate)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="calendar-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>วันที่สิ้นสุดสัญญา</Text>
          </View>
          <Text style={s.rowVal}>{formatDate(contract.endDate)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="document-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ระยะเวลาสัญญา</Text>
          </View>
          <Text style={[s.rowVal, { color: '#7C5CFC', fontWeight: '700' }]}>
            {contract.contractDuration}
          </Text>
        </View>
      </View>

      {contract.pdfUrl && (
        <View style={s.cardFooter}>
          <TouchableOpacity style={s.btnFill} onPress={openPdf}>
            <Ionicons name="document-text-outline" size={14} color="#fff" />
            <Text style={s.btnFillText}>ดูสัญญา PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default function ContractTab() {
  const [contracts, setContracts] = useState<MyContractItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    financeApi.getMyContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ActivityIndicator color="#7C5CFC" style={{ marginTop: 60 }} />

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {contracts.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="document-text-outline" size={48} color="#C4B5FD" />
          <Text style={s.emptyText}>ยังไม่มีสัญญา</Text>
        </View>
      ) : (
        contracts.map(c => <ContractCard key={c.contractId} contract={c} />)
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 14, gap: 12 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  cardHeader: { backgroundColor: '#7C5CFC', padding: 14, gap: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerProp: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  cardBody: { padding: 14 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 13, color: '#8B8A9B' },
  rowVal: { fontSize: 13, color: '#2C2C2A', fontWeight: '500' },
  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)' },
  cardFooter: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.07)', paddingTop: 12,
  },
  btnFill: {
    height: 44, borderRadius: 12,
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
