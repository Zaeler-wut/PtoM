import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

const MONTH_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

const MOCK_BOOKING = {
  propertyName: 'Purple Residence',
  roomName: 'Standard',
  rentPerMonth: 4500,
  bookingFee: 2000,
}

export default function BookingSummaryScreen() {
  const { id, propertyId, moveInDate } = useLocalSearchParams<{
    id: string
    propertyId: string
    moveInDate: string
  }>()

  const booking = MOCK_BOOKING
  const date = moveInDate ? new Date(moveInDate) : new Date()
  const formattedDate = `${date.getDate()} ${MONTH_TH[date.getMonth()]} ${date.getFullYear()}`

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(app)/(tenant)/booking/[id]', params: { id, propertyId } } as any)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>จองห้องพัก</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.body}>

          <View style={s.roomCard}>
            <View style={s.roomCardLeft}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.roomPropName}>{booking.propertyName}</Text>
            </View>
            <Text style={s.roomName}>{booking.roomName}</Text>
            <View style={s.roomPriceRow}>
              <View>
                <Text style={s.roomPriceLabel}>ค่าเช่า/เดือน</Text>
                <Text style={s.roomPriceVal}>{booking.rentPerMonth.toLocaleString('th-TH')} ฿</Text>
              </View>
              <View>
                <Text style={s.roomPriceLabel}>ค่าจองห้อง</Text>
                <Text style={s.roomPriceVal}>{booking.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>สรุปการจอง</Text>
            </View>

            <View style={s.sectionBody}>
              <View style={s.summaryRow}>
                <View style={s.summaryIconWrap}>
                  <Ionicons name="calendar-outline" size={16} color="#7C5CFC" />
                </View>
                <View>
                  <Text style={s.summaryLabel}>วันที่เข้าอยู่</Text>
                  <Text style={s.summaryVal}>{formattedDate}</Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.summaryRow}>
                <View style={s.summaryIconWrap}>
                  <Ionicons name="card-outline" size={16} color="#7C5CFC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.summaryLabel}>ค่าจองห้อง</Text>
                </View>
                <Text style={s.summaryAmount}>{booking.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>

              <View style={s.divider} />

              <View style={s.totalBlock}>
                <Text style={s.totalLabel}>รวมทั้งหมด</Text>
                <Text style={s.totalVal}>{booking.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.noteCard}>
            <View style={s.noteHeader}>
              <Ionicons name="card" size={16} color="#854F0B" />
              <Text style={s.noteHeaderText}>การชำระเงินและการยืนยัน</Text>
            </View>
            <View style={s.noteList}>
              <View style={s.noteRow}>
                <Ionicons name="checkmark" size={13} color="#854F0B" />
                <Text style={s.noteText}>ต้องรอผู้ดูแลยืนยันการจองก่อน</Text>
              </View>
              <View style={s.noteRow}>
                <Ionicons name="checkmark" size={13} color="#854F0B" />
                <Text style={s.noteText}>ชำระค่าจองห้อง {booking.bookingFee.toLocaleString('th-TH')} บาท ภายใน 24 ชั่วโมง</Text>
              </View>
              <View style={s.noteRow}>
                <Ionicons name="checkmark" size={13} color="#854F0B" />
                <Text style={s.noteText}>ค่าแนะนำมัดจำจ่ายตอนทำสัญญา</Text>
              </View>
            </View>
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.backFooterBtn}
              onPress={() => router.push({ pathname: '/(app)/(tenant)/booking/[id]', params: { id, propertyId } } as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color="#7C5CFC" />
              <Text style={s.backFooterText}>ย้อนกลับ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.payBtn}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: '/(app)/(tenant)/payment/[id]',
                params: { id, propertyId, moveInDate }
              } as any)}
            >
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={s.payBtnText}>ชำระเงิน</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },

  header: {
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  body: { padding: 16, gap: 16 },

  roomCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)',
  },
  roomCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  roomPropName: { fontSize: 11, color: '#7C5CFC' },
  roomName: { fontSize: 20, fontWeight: '700', color: '#7C5CFC', marginBottom: 12 },
  roomPriceRow: { flexDirection: 'row', gap: 32 },
  roomPriceLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  roomPriceVal: { fontSize: 16, fontWeight: '700', color: '#7C5CFC' },

  section: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#00C853', paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionBar: { width: 4, height: 20, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sectionBody: { padding: 16 },

  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  summaryIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: { fontSize: 12, color: '#1F1D2E', marginBottom: 2 },
  summaryVal: { fontSize: 14, fontWeight: '600', color: '#1F1D2E' },
  summaryAmount: { fontSize: 16, fontWeight: '700', color: '#00C853', marginLeft: 'auto' },

  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginVertical: 10 },

  totalBlock: {
    backgroundColor: '#7C5CFC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  totalVal: { fontSize: 20, fontWeight: '700', color: '#fff' },

  noteCard: {
    backgroundColor: '#FFF8E6', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: '#FBBF24',
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  noteHeaderText: { fontSize: 14, fontWeight: '700', color: '#854F0B' },
  noteList: { gap: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noteText: { fontSize: 13, color: '#854F0B', flex: 1, lineHeight: 20 },

  btnRow: { flexDirection: 'row', gap: 12 },
  backFooterBtn: {
    flex: 1, height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  backFooterText: { fontSize: 15, fontWeight: '600', color: '#7C5CFC' },
  payBtn: {
    flex: 1, height: 52, borderRadius: 14,
    backgroundColor: '#00C853',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})