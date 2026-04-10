import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_BOOKINGS, formatAmount, type MockBooking } from './mockData'
import { BookingStatusBadge } from './StatusBadges'

function BookingCard({ booking }: { booking: MockBooking }) {
  const isConfirmed = booking.status === 'CONFIRMED'
  const isPending   = booking.status === 'PENDING'
  const headerBg    = isConfirmed ? '#3B82F6' : '#3B82F6'

  return (
    <View style={s.card}>
      {/* Header */}
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
          <Text style={s.headerSub}>{booking.roomType} · ห้อง {booking.roomNumber}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="person-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ผู้จอง</Text>
          </View>
          <Text style={s.rowVal}>{booking.tenantName}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="calendar-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>วันที่เข้าอยู่</Text>
          </View>
          <Text style={s.rowVal}>{booking.moveInDate}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="cash-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ค่ามัดจำ</Text>
          </View>
          <Text style={s.rowVal}>{formatAmount(booking.bookingFee)} ฿</Text>
        </View>

        <View style={s.divider} />

        <View style={s.row}>
          <View style={s.rowLeft}>
            <Ionicons name="home-outline" size={14} color="#8B8A9B" />
            <Text style={s.rowLabel}>ค่าเช่า/เดือน</Text>
          </View>
          <Text style={[s.rowVal, { color: '#E24B4A', fontWeight: '700' }]}>
            {formatAmount(booking.rentPerMonth)} ฿
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.noteBox}>
          <Ionicons name="calendar-outline" size={12} color="#534AB7" />
          <Text style={s.noteText}>จองเมื่อ {booking.bookedAt}</Text>
        </View>
      </View>

      {/* Cancel button — เฉพาะ PENDING */}
      {isPending && (
        <View style={s.cardFooter}>
          <TouchableOpacity style={s.btnCancel}>
            <Ionicons name="close" size={14} color="#E24B4A" />
            <Text style={s.btnCancelText}>ยกเลิกการจอง</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default function BookingTab() {
  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {MOCK_BOOKINGS.map(booking => <BookingCard key={booking.id} booking={booking} />)}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  content: { padding: 14, gap: 12 },
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

  cardFooter: {
    paddingHorizontal: 14, paddingBottom: 14,
    paddingTop: 2,
  },
  btnCancel: {
    height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: '#E24B4A',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnCancelText: { fontSize: 14, fontWeight: '600', color: '#E24B4A' },
})