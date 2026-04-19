import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { BillStatus, BookingStatus, ContractStatus } from '../../api/finance/financeApi'

export function BillStatusBadge({ status }: { status: BillStatus }) {
  const config: Record<BillStatus, { label: string; color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
    DRAFT:     { label: 'ร่าง',       color: '#5F5E5A', bg: '#F1EFE8', border: '#B4B2A9', icon: 'document-outline' },
    READY:     { label: 'พร้อมส่ง',   color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB', icon: 'checkmark-done-outline' },
    PENDING:   { label: 'รอชำระ',     color: '#854F0B', bg: '#FFF8E6', border: '#FBBF24', icon: 'hourglass-outline' },
    VERIFYING: { label: 'กำลังตรวจ', color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB', icon: 'search-outline' },
    PAID:      { label: 'ชำระแล้ว',  color: '#fff',    bg: '#4CAF50', border: '#4CAF50', icon: 'checkmark-circle' },
  }
  const c = config[status]
  return (
    <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Ionicons name={c.icon} size={10} color={c.color} />
      <Text style={[s.text, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    PENDING:    { label: 'รอยืนยัน',   color: '#fff', bg: '#FACC15', icon: 'hourglass-outline' },
    CONFIRMED:  { label: 'ยืนยันแล้ว', color: '#fff',    bg: '#22C55E', icon: 'checkmark-circle' },
    CHECKED_IN: { label: 'เข้าพักแล้ว',color: '#fff',    bg: '#378ADD', icon: 'home' },
    CANCELLED:  { label: 'ยกเลิก',     color: '#fff',    bg: '#E24B4A', icon: 'close-circle' },
  }
  const c = config[status]
  return (
    <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.bg }]}>
      <Ionicons name={c.icon} size={10} color={c.color} />
      <Text style={[s.text, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config: Record<ContractStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    ACTIVE:          { label: 'ใช้งาน',      color: '#fff',    bg: '#22C55E', icon: 'checkmark-circle' },
    MOVE_OUT_NOTICE: { label: 'แจ้งย้ายออก', color: '#633806', bg: '#FACC15', icon: 'exit-outline' },
    ENDED:           { label: 'สิ้นสุดแล้ว', color: '#fff',    bg: '#888780', icon: 'close-circle' },
  }
  const c = config[status]
  return (
    <View style={[s.badge, { backgroundColor: c.bg, borderColor: c.bg }]}>
      <Ionicons name={c.icon} size={10} color={c.color} />
      <Text style={[s.text, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 0.5,
  },
  text: { fontSize: 10, fontWeight: '600' },
})