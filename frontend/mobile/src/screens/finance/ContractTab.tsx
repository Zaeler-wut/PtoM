import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_CONTRACTS, type MockContract } from './mockData'
import { ContractStatusBadge } from './StatusBadges'

function ContractCard({ contract }: { contract: MockContract }) {
  return (
    <View style={s.card}>
      {/* Purple header */}
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
          <Text style={s.headerSub}>สัญญา {contract.durationYear} ปี</Text>
        </View>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="calendar-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>วันที่เริ่มสัญญา</Text>
          </View>
          <Text style={s.rowVal}>{contract.startDate}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="document-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ระยะเวลาสัญญา</Text>
          </View>
          <Text style={[s.rowVal, { color: '#6C63FF', fontWeight: '700' }]}>
            {contract.durationYear} ปี
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={s.cardFooter}>
        <TouchableOpacity style={s.btnOutline}>
          <Ionicons name="document-text-outline" size={14} color="#6C63FF" />
          <Text style={s.btnOutlineText}>ดูรายละเอียดสัญญา</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnFill}>
          <Ionicons name="download-outline" size={14} color="#fff" />
          <Text style={s.btnFillText}>ดาวน์โหลดสัญญา PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function ContractTab() {
  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {MOCK_CONTRACTS.map(contract => <ContractCard key={contract.id} contract={contract} />)}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 14, gap: 12 },
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
    paddingHorizontal: 14, paddingBottom: 14, gap: 8,
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.07)',
    paddingTop: 12,
  },
  btnOutline: {
    height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: '#6C63FF',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnOutlineText: { fontSize: 14, fontWeight: '600', color: '#6C63FF' },
  btnFill: {
    height: 44, borderRadius: 12,
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})