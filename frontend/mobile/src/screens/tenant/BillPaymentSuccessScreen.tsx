import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useRef } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'

export default function BillPaymentSuccessScreen() {
  const { propertyName, billingPeriod, tenantName, roomNumber, total } =
    useLocalSearchParams<{
      propertyName: string
      billingPeriod: string
      tenantName: string
      roomNumber: string
      total: string
    }>()

  const scrollRef = useRef<ScrollView>(null)
  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, []))

  const totalNum = Number(total) || 0

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/(app)/(tenant)/finance', params: { tab: 'bill' } } as any)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ชำระค่าเช่า</Text>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.body}>

          {/* Top card */}
          <View style={s.topCard}>
            <View style={s.topCardRow}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.topPropName}>{propertyName}</Text>
            </View>
            <Text style={s.topPeriod}>{billingPeriod}</Text>
            {(tenantName || roomNumber) ? (
              <View style={s.topCardRow}>
                <Ionicons name="person-outline" size={12} color="#7C5CFC" />
                <Text style={s.topSub}>{tenantName}  •  ห้อง {roomNumber}</Text>
              </View>
            ) : null}
            <View style={s.topAmountRow}>
              <Text style={s.topAmountLabel}>ยอดชำระ</Text>
              <Text style={s.topAmount}>{totalNum.toLocaleString('th-TH')} ฿</Text>
            </View>
          </View>

          {/* Success */}
          <View style={s.successWrap}>
            <View style={s.successCircle}>
              <Ionicons name="checkmark" size={40} color="#4CAF50" />
            </View>
            <Text style={s.successTitle}>ชำระเงินสำเร็จ!</Text>
          </View>

          <View style={s.statusCard}>
            <Ionicons name="hourglass-outline" size={16} color="#00C853" />
            <Text style={s.statusText}>รอผู้ดูแลยืนยันการชำระเงิน</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
            <View style={s.infoHeader}>
              <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
              <Text style={[s.infoLabel, { color: '#3B82F6' }]}>วันที่</Text>
            </View>
            <Text style={[s.infoVal, { color: '#3B82F6' }]}>{billingPeriod}</Text>
          </View>

          <View style={[s.infoCard, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
            <View style={s.infoHeader}>
              <Ionicons name="cash-outline" size={14} color="#F5A623" />
              <Text style={[s.infoLabel, { color: '#F5A623' }]}>ยอดชำระเงิน</Text>
            </View>
            <Text style={[s.infoValAmount, { color: '#F5A623' }]}>{totalNum.toLocaleString('th-TH')} ฿</Text>
          </View>

          <TouchableOpacity
            style={s.homeBtn}
            onPress={() => router.replace({ pathname: '/(app)/(tenant)/finance', params: { tab: 'bill' } } as any)}
            activeOpacity={0.85}
          >
            <Text style={s.homeBtnText}>กลับหน้าการเงิน</Text>
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

  topCard: {
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)', gap: 4,
  },
  topCardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topPropName: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },
  topPeriod: { fontSize: 16, fontWeight: '700', color: '#7C5CFC', marginVertical: 2 },
  topSub: { fontSize: 11, color: '#7C5CFC' },
  topAmountRow: { marginTop: 8 },
  topAmountLabel: { fontSize: 11, color: '#7C5CFC', marginBottom: 2 },
  topAmount: { fontSize: 26, fontWeight: '700', color: '#7C5CFC' },

  successWrap: { alignItems: 'center', paddingVertical: 12 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#DCFCE7', borderWidth: 3, borderColor: '#00C853',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1F1D2E' },

  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,200,83,0.15)', borderRadius: 12, padding: 14,
    borderWidth: 0.5, borderColor: '#00C853', justifyContent: 'center',
  },
  statusText: { fontSize: 14, fontWeight: '600', color: '#00C853' },

  infoCard: { borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#9CA3AF' },
  infoVal: { fontSize: 16, fontWeight: '600' },
  infoValAmount: { fontSize: 20, fontWeight: '700' },

  homeBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
