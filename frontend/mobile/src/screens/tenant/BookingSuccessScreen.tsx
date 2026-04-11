import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useRef } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'

const MONTH_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

const MOCK_SUCCESS = {
  propertyName: 'Purple Residence',
  roomName: 'Standard',
  rentPerMonth: 4500,
  bookingFee: 2000,
  tenantName: 'วุฒิพงศ์ จงกลิกรรม',
}

export default function BookingSuccessScreen() {
  const { id, propertyId, moveInDate } = useLocalSearchParams<{
    id: string; propertyId: string; moveInDate: string
  }>()

  const scrollRef = useRef<ScrollView>(null)
  const data = MOCK_SUCCESS
  const date = moveInDate ? new Date(moveInDate) : new Date()
  const formattedDate = `${date.getDate()} ${MONTH_TH[date.getMonth()]} ${date.getFullYear()}`

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }, [])
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tenant)' as any)} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>จองห้องพัก</Text>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.body}>

          <View style={s.roomCard}>
            <View style={s.roomCardLeft}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.roomPropName}>{data.propertyName}</Text>
            </View>
            <Text style={s.roomName}>{data.roomName}</Text>
            <View style={s.roomPriceRow}>
              <View>
                <Text style={s.roomPriceLabel}>ค่าเช่า/เดือน</Text>
                <Text style={s.roomPriceVal}>{data.rentPerMonth.toLocaleString('th-TH')} ฿</Text>
              </View>
              <View>
                <Text style={s.roomPriceLabel}>ค่าจองห้อง</Text>
                <Text style={s.roomPriceVal}>{data.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.successWrap}>
            <View style={s.successCircle}>
              <Ionicons name="checkmark" size={40} color="#4CAF50" />
            </View>
            <Text style={s.successTitle}>ชำระเงินสำเร็จ!</Text>
          </View>

          <View style={s.statusCard}>
            <Ionicons name="hourglass-outline" size={16} color="#00C853" />
            <Text style={s.statusText}>รอผู้ดูแลยืนยันการจอง</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: 'rgba(124,92,252,0.1)' }]}>
            <View style={s.infoHeader}>
              <Ionicons name="person-outline" size={14} color="#7C5CFC" />
              <Text style={[s.infoLabel, { color: '#7C5CFC' }]}>ผู้จอง</Text>
            </View>
            <Text style={[s.infoVal, { color: '#7C5CFC' }]}>{data.tenantName}</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
            <View style={s.infoHeader}>
              <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
              <Text style={[s.infoLabel, { color: '#3B82F6' }]}>วันที่เข้าอยู่</Text>
            </View>
            <Text style={[s.infoVal, { color: '#3B82F6' }]}>{formattedDate}</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
            <View style={s.infoHeader}>
              <Ionicons name="cash-outline" size={14} color="#F5A623" />
              <Text style={[s.infoLabel, { color: '#F5A623' }]}>ยอดชำระแล้ว</Text>
            </View>
            <Text style={[s.infoValAmount, { color: '#F5A623' }]}>{data.bookingFee.toLocaleString('th-TH')} ฿</Text>
          </View>

          <TouchableOpacity
            style={s.detailBtn}
            activeOpacity={0.85}
            onPress={() => router.replace({ pathname: '/(app)/(tenant)/finance', params: { tab: 'booking' } } as any)}
          >
            <Text style={s.detailBtnText}>ดูรายละเอียดการชำระเงิน</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.homeBtn}
            onPress={() => router.replace('/(app)/(tenant)' as any)}
            activeOpacity={0.8}
          >
            <Text style={s.homeBtnText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>

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
  body: { padding: 16, gap: 12 },
  roomCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)',
  },
  roomCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  roomPropName: { fontSize: 11, color: '#7C5CFC' },
  roomName: { fontSize: 20, fontWeight: '700', color: '#7C5CFC', marginBottom: 12 },
  roomPriceRow: { flexDirection: 'row', gap: 32 },
  roomPriceLabel: { fontSize: 11, color: '#7C5CFC', marginBottom: 4 },
  roomPriceVal: { fontSize: 16, fontWeight: '700', color: '#7C5CFC' },
  successWrap: { alignItems: 'center', paddingVertical: 12 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#DCFCE7', borderWidth: 3, borderColor: '#00C853',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1F1D2E' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0, 200, 83, 0.15)', borderRadius: 12, padding: 14,
    borderWidth: 0.5, borderColor: '#00C853', justifyContent: 'center',
  },
  statusText: { fontSize: 14, fontWeight: '600', color: '#00C853' },
  infoCard: { borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#9CA3AF' },
  infoVal: { fontSize: 16, fontWeight: '600', color: '#1F1D2E' },
  infoValAmount: { fontSize: 20, fontWeight: '700', color: '#1F1D2E' },
  detailBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  detailBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  homeBtn: {
    height: 52, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  homeBtnText: { fontSize: 15, fontWeight: '600', color: '#1F1D2E' },
})