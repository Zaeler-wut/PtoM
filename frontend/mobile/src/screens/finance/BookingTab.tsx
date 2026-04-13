import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { financeApi, type MyBookingItem } from '../../api/finance/financeApi'
import { BookingStatusBadge } from './StatusBadges'

const MONTH_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTH_TH[d.getMonth()]} ${d.getFullYear() + 543}`
}

function formatAmount(n: number) {
  return n.toLocaleString('th-TH')
}

function BookingCard({
  booking, onCancel,
}: {
  booking: MyBookingItem
  onCancel: (id: string) => void
}) {
  const headerBg = booking.status === 'CONFIRMED' ? '#22C55E'
    : booking.status === 'CHECKED_IN' ? '#3B82F6'
    : booking.status === 'CANCELLED' ? '#888780'
    : '#3B82F6'

  const confirmCancel = () => {
    Alert.alert('ยืนยันการยกเลิก', 'คุณต้องการยกเลิกการจองนี้ใช่ไหม?', [
      { text: 'ไม่ใช่', style: 'cancel' },
      { text: 'ยกเลิกการจอง', style: 'destructive', onPress: () => onCancel(booking.bookingId) },
    ])
  }

  return (
    <View style={s.card}>
      <View style={[s.cardHeader, { backgroundColor: headerBg }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.headerProp}>{booking.propertyName}</Text>
          </View>
          <BookingStatusBadge status={booking.status} />
        </View>
        <Text style={s.headerTitle}>การจองห้องพัก</Text>
        <View style={s.headerSubRow}>
          <Ionicons name="home-outline" size={11} color="rgba(255,255,255,0.85)" />
          <Text style={s.headerSub}>
            {booking.roomTypeName}
            {booking.roomNumber ? ` · ห้อง ${booking.roomNumber}` : ''}
          </Text>
        </View>
      </View>

      <View style={s.cardBody}>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="person-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ผู้จอง</Text>
          </View>
          <Text style={s.rowVal}>{booking.firstName} {booking.lastName}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="calendar-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>วันที่เข้าอยู่</Text>
          </View>
          <Text style={s.rowVal}>{formatDate(booking.moveInDate)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="cash-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ค่าจองห้อง</Text>
          </View>
          <Text style={s.rowVal}>{formatAmount(booking.bookingFee)} ฿</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="home-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ค่าเช่า/เดือน</Text>
          </View>
          <Text style={[s.rowVal, { color: '#7C5CFC', fontWeight: '700' }]}>
            {formatAmount(booking.roomPrice)} ฿
          </Text>
        </View>
        <View style={s.divider} />
        <View style={s.noteBox}>
          <Ionicons name="calendar-outline" size={12} color="#534AB7" />
          <Text style={s.noteText}>จองเมื่อ {formatDate(booking.createdAt)}</Text>
        </View>
      </View>

      {booking.canCancel && (
        <View style={s.cardFooter}>
          <TouchableOpacity style={s.btnCancel} onPress={confirmCancel}>
            <Ionicons name="close" size={14} color="#E24B4A" />
            <Text style={s.btnCancelText}>ยกเลิกการจอง</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default function BookingTab() {
  const [bookings, setBookings] = useState<MyBookingItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await financeApi.getMyBookings()
      setBookings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (bookingId: string) => {
    try {
      await financeApi.cancelBooking(bookingId)
      Alert.alert('สำเร็จ', 'ยกเลิกการจองเรียบร้อยแล้ว')
      load()
    } catch (e: any) {
      Alert.alert('ข้อผิดพลาด', e.response?.data?.error ?? e.message)
    }
  }

  if (loading) return <ActivityIndicator color="#7C5CFC" style={{ marginTop: 60 }} />

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {bookings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={48} color="#C4B5FD" />
          <Text style={s.emptyText}>ยังไม่มีการจอง</Text>
        </View>
      ) : (
        bookings.map(b => (
          <BookingCard key={b.bookingId} booking={b} onCancel={handleCancel} />
        ))
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
  cardHeader: { padding: 14, gap: 2 },
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
  noteBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEEDFE', borderRadius: 10,
    padding: 10, marginTop: 4,
  },
  noteText: { fontSize: 12, color: '#534AB7' },
  cardFooter: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },
  btnCancel: {
    height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: '#E24B4A',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnCancelText: { fontSize: 14, fontWeight: '600', color: '#E24B4A' },
})
