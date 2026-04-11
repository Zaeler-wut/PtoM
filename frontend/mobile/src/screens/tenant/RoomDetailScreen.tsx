import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useRef } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'

const MOCK_ROOM = {
  id: '1',
  name: 'Standard',
  propertyName: 'Purple Residence',
  coverImage: null,
  availableRooms: 5,
  totalRooms: 40,
  size: 20,
  roomPrice: 6500,
  securityDeposit: 6500,
  advanceRent: 2500,
  bookingFee: 2000,
  waterRate: 20,
  electricRate: 7,
  facilities: ['แอร์', 'ห้องน้ำในตัว', 'ระเบียง'],
  description: 'ค่าประกัน+ล่วงหน้า จ่ายตอนทำสัญญา\nค่าจองห้องรวมอยู่ในค่าล่วงหน้าแล้ว',
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.sectionHeader, { backgroundColor: color }]}>
      <View style={s.sectionHeaderBar} />
      <Text style={s.sectionHeaderText}>{label}</Text>
    </View>
  )
}

export default function RoomDetailScreen() {
  const { id, propertyId } = useLocalSearchParams<{ id: string; propertyId: string }>()
  const scrollRef = useRef<ScrollView>(null)
  const room = MOCK_ROOM

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }, [])
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(app)/(tenant)/property/[id]', params: { id: propertyId } } as any)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{room.name}</Text>
          <Text style={s.headerSub}>{room.propertyName}</Text>
        </View>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>ห้อง {room.name}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        <View style={s.imageWrap}>
          {room.coverImage ? (
            <Image source={{ uri: room.coverImage }} style={s.coverImage} resizeMode="cover" />
          ) : (
            <View style={[s.coverImage, s.imagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#C4B5FD" />
            </View>
          )}
          <View style={s.availableBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#fff" />
            <Text style={s.availableBadgeText}>ว่าง {room.availableRooms} ห้อง</Text>
          </View>
        </View>

        <View style={s.body}>

          <View style={s.section}>
            <View style={[s.sectionHeader, { backgroundColor: '#7C5CFC', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={s.sectionHeaderBar} />
                <Text style={s.sectionHeaderText}>รายละเอียดค่าใช้จ่าย</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                <Ionicons name="resize-outline" size={13} color="#fff" />
                <Text style={{ fontSize: 12, color: '#fff' }}>ขนาดห้อง {room.size} ตารางเมตร</Text>
              </View>
            </View>
            <View style={s.sectionBody}>
              <View style={s.priceRow}>
                <View style={s.priceLeft}>
                  <Ionicons name="cash-outline" size={18} color="#F5A623" />
                  <Text style={s.priceLabel}>ค่าเช่ารายเดือน</Text>
                </View>
                <Text style={s.priceVal}>{room.roomPrice.toLocaleString('th-TH')} ฿</Text>
              </View>
              <View style={s.divider} />
              <View style={s.priceRow}>
                <View style={s.priceLeft}>
                  <Ionicons name="home-outline" size={18} color="#7C5CFC" />
                  <Text style={s.priceLabel}>ค่าประกัน+ล่วงหน้า 1 เดือน</Text>
                </View>
                <Text style={s.priceVal}>{(room.securityDeposit + room.advanceRent).toLocaleString('th-TH')} ฿</Text>
              </View>
              <View style={s.divider} />
              <View style={s.priceRow}>
                <View style={s.priceLeft}>
                  <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                  <Text style={s.priceLabel}>ค่าจองห้อง</Text>
                </View>
                <Text style={s.priceVal}>{room.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
              {room.description && (
                <View style={s.noteBox}>
                  {room.description.split('\n').map((line, i) => (
                    <View key={i} style={s.noteRow}>
                      <Ionicons name="information-circle" size={13} color="#7C5CFC" />
                      <Text style={s.noteText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={s.section}>
            <SectionHeader label="ค่าสาธารณูปโภค" color="#3B82F6" />
            <View style={s.sectionBody}>
              <View style={s.utilRow}>
                <View style={[s.utilIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flash" size={20} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.utilLabel}>ค่าไฟฟ้า</Text>
                  <Text style={s.utilUnit}>ต่อหน่วย</Text>
                </View>
                <Text style={s.utilVal}>{room.electricRate} ฿</Text>
              </View>
              <View style={s.divider} />
              <View style={s.utilRow}>
                <View style={[s.utilIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="water" size={20} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.utilLabel}>ค่าน้ำประปา</Text>
                  <Text style={s.utilUnit}>ต่อหน่วย</Text>
                </View>
                <Text style={s.utilVal}>{room.waterRate} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <SectionHeader label="สิ่งอำนวยความสะดวกในห้อง" color="#00C853" />
            <View style={s.sectionBody}>
              {room.facilities.map((f, i) => (
                <View key={i}>
                  <View style={s.facilityRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#00C853" />
                    <Text style={s.facilityText}>{f}</Text>
                  </View>
                  {i < room.facilities.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          </View>

          <View style={s.section}>
            <SectionHeader label="สถานะห้อง" color="#FF8C00" />
            <View style={[s.sectionBody, { flexDirection: 'row', gap: 12 }]}>
              <View style={s.statCard}>
                <Text style={s.statLabel}>ห้องทั้งหมด</Text>
                <Text style={[s.statNum, { color: '#FF8C00' }]}>{room.totalRooms}</Text>
                <Text style={s.statUnit}>ห้อง</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statLabel}>ห้องว่าง</Text>
                <Text style={[s.statNum, { color: '#00C853' }]}>{room.availableRooms}</Text>
                <Text style={s.statUnit}>ห้อง</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={s.bookBtn}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/(app)/(tenant)/booking/[id]', params: { id, propertyId } } as any)}
          >
            <Text style={s.bookBtnText}>จองห้องนี้</Text>
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
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  headerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  imageWrap: { position: 'relative' },
  coverImage: { width: '100%', height: 220 },
  imagePlaceholder: { backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  availableBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#00C853', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  availableBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  body: { padding: 16, gap: 16 },
  section: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionHeaderBar: { width: 4, height: 20, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 },
  sectionHeaderText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sectionBody: { padding: 16 },
  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginVertical: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceLabel: { fontSize: 14, color: '#1F1D2E' },
  priceVal: { fontSize: 16, fontWeight: '700', color: '#7C5CFC' },
  noteBox: { backgroundColor: '#F5F3FF', borderRadius: 10, padding: 10, marginTop: 10, gap: 6 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  noteText: { fontSize: 12, color: '#7C5CFC', flex: 1 },
  utilRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  utilIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  utilLabel: { fontSize: 14, fontWeight: '500', color: '#1F1D2E' },
  utilUnit: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  utilVal: { fontSize: 18, fontWeight: '700', color: '#1F1D2E' },
  facilityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  facilityText: { fontSize: 14, color: '#1F1D2E' },
  statCard: {
    flex: 1, backgroundColor: '#F5F3FF', borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statLabel: { fontSize: 12, color: '#9CA3AF' },
  statNum: { fontSize: 28, fontWeight: '700', color: '#1F1D2E' },
  statUnit: { fontSize: 11, color: '#9CA3AF' },
  bookBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})