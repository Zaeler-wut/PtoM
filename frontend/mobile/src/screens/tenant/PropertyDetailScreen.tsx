import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useRef } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { mobilePropertyApi } from '../../api/property/mobilePropertyApi'
import type { MobilePropertyDetail } from '../../types/mobileProperty.types'

const FACILITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Wi-Fi': 'wifi-outline',
  'ลิฟต์': 'layers-outline',
  'ที่จอดรถ': 'car-outline',
  'นักรีด': 'shirt-outline',
  'ฟิตเนส': 'barbell-outline',
  'CCTV 24 ชม.': 'camera-outline',
  'ร้านสะดวกซื้อ': 'storefront-outline',
  'ห้องซักผ้า': 'water-outline',
}

function FacilityItem({ label }: { label: string }) {
  const icon = FACILITY_ICONS[label] ?? 'checkmark-circle-outline'
  return (
    <View style={s.facilityItem}>
      <Ionicons name={icon} size={18} color="#7C5CFC" />
      <Text style={s.facilityLabel}>{label}</Text>
    </View>
  )
}

function SectionHeader({ icon, title, sub }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon} size={18} color="#7C5CFC" />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      {sub && <Text style={s.sectionSub}>{sub}</Text>}
    </View>
  )
}

function RoomTypeCard({ roomType, propertyId }: { roomType: any; propertyId: string }) {
  return (
    <View style={s.roomCard}>
      <View style={s.roomCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.roomName}>{roomType.name}</Text>
          <View style={s.roomTagRow}>
            <View style={s.roomTag}>
              <Text style={s.roomTagText}>ขนาด {roomType.size} ตร.ม.</Text>
            </View>
            {roomType.facilities?.slice(0, 3).map((f: string, i: number) => (
              <View key={i} style={s.roomTag}>
                <Text style={s.roomTagText}>{f}</Text>
              </View>
            ))}
            {roomType.facilities?.length > 3 && (
              <View style={s.roomTag}>
                <Text style={s.roomTagText}>+{roomType.facilities.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={s.roomPriceBox}>
          <Text style={s.roomPrice}>{roomType.roomPrice?.toLocaleString('th-TH')}</Text>
          <Text style={s.roomPriceSub}>฿ / เดือน</Text>
          <Text style={s.roomAvailable}>ว่าง {roomType.availableRooms ?? 0} ห้อง</Text>
          {roomType.preparingCount > 0 && roomType.availableRooms === roomType.preparingCount && roomType.preparingAvailableDate && (
            <View style={s.preparingTag}>
              <Text style={s.preparingTagText}>
                จะว่าง {new Date(roomType.preparingAvailableDate + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={s.roomDetailBtn}
        onPress={() => router.push({ pathname: '/(app)/(tenant)/room/[id]', params: { id: roomType.id, propertyId } } as any)}
        activeOpacity={0.85}
      >
        <Text style={s.roomDetailBtnText}>ดูรายละเอียดห้อง</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [property, setProperty] = useState<MobilePropertyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<ScrollView>(null)

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }, [])
  )

  useFocusEffect(
    useCallback(() => {
      if (!id) return
      setIsLoading(true)
      mobilePropertyApi.getDetail(id)
        .then(setProperty)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }, [id])
  )

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ActivityIndicator color="#7C5CFC" style={{ marginTop: 40 }} />
      </SafeAreaView>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#9CA3AF' }}>ไม่พบข้อมูลที่พัก</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>รายละเอียดที่พัก</Text>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={s.imageWrap}>
          {property.coverImage ? (
            <Image source={{ uri: property.coverImage }} style={s.coverImage} resizeMode="cover" />
          ) : (
            <View style={[s.coverImage, s.imagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#C4B5FD" />
            </View>
          )}
          {property.allowOnlineBooking && (
            <View style={s.onlineBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
              <Text style={s.onlineBadgeText}>ใช้ระบบจองออนไลน์</Text>
            </View>
          )}
        </View>

        <View style={s.body}>

          <View style={s.nameSection}>
            <View style={{ flex: 1 }}>
              <Text style={s.propertyName}>{property.name}</Text>
              <View style={s.addressRow}>
                <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                <Text style={s.addressText} numberOfLines={2}>{property.address}</Text>
              </View>
              <Text style={s.priceLabel}>ราคาเริ่มต้น</Text>
              <View style={s.priceRow}>
                <Text style={s.priceText}>
                  {property.priceMin?.toLocaleString('th-TH')} - {property.priceMax?.toLocaleString('th-TH')}
                </Text>
                <Text style={s.priceUnit}>บาท / เดือน</Text>
              </View>
            </View>
            <View style={s.availableBox}>
              <Text style={s.availableNum}>{property.availableRooms ?? 0}</Text>
              <Text style={s.availableSub}>ห้องว่าง</Text>
              <Text style={s.availableTotal}>จาก {property.totalRooms ?? 0} ห้อง</Text>
            </View>
          </View>

          {property.facilities?.length > 0 && (
            <View style={s.section}>
              <SectionHeader icon="star-outline" title="สิ่งอำนวยความสะดวก" />
              <View style={s.facilityGrid}>
                {property.facilities.map((f: string, i: number) => (
                  <FacilityItem key={i} label={f} />
                ))}
              </View>
            </View>
          )}

          {property.description && (
            <View style={s.section}>
              <SectionHeader icon="document-text-outline" title="รายละเอียด" />
              <Text style={s.descText}>{property.description}</Text>
            </View>
          )}

          {property.roomTypes?.length > 0 && (
            <View style={s.section}>
              <SectionHeader
                icon="home-outline"
                title="ประเภทห้องพัก"
                sub={`${property.roomTypes.length} ประเภท`}
              />
              {property.roomTypes.map((rt: any) => (
                <RoomTypeCard key={rt.id} roomType={rt} propertyId={property.id} />
              ))}
            </View>
          )}

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
  imageWrap: { position: 'relative' },
  coverImage: { width: '100%', height: 220 },
  imagePlaceholder: { backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  onlineBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#7C5CFC', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  onlineBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  body: { padding: 16, gap: 16 },
  nameSection: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', gap: 12,
  },
  propertyName: { fontSize: 18, fontWeight: '700', color: '#1F1D2E', marginBottom: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 12 },
  addressText: { flex: 1, fontSize: 12, color: '#6B7280' },
  priceLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceText: { fontSize: 20, fontWeight: '700', color: '#7C5CFC' },
  priceUnit: { fontSize: 11, color: '#9CA3AF' },
  availableBox: {
    backgroundColor: '#F5F3FF', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 80,
  },
  availableNum: { fontSize: 28, fontWeight: '700', color: '#7C5CFC' },
  availableSub: { fontSize: 11, color: '#7C5CFC' },
  availableTotal: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', flex: 1 },
  sectionSub: { fontSize: 12, color: '#9CA3AF' },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  facilityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3FF', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, minWidth: '45%',
  },
  facilityLabel: { fontSize: 13, color: '#1F1D2E', fontWeight: '500' },
  descText: { fontSize: 13, color: '#6B7280', lineHeight: 22 },
  roomCard: {
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14, padding: 14, marginBottom: 12,
  },
  roomCardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  roomName: { fontSize: 16, fontWeight: '700', color: '#1F1D2E', marginBottom: 8 },
  roomTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roomTag: {
    backgroundColor: '#EDE9FE', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  roomTagText: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },
  roomPriceBox: {
    backgroundColor: '#F5F3FF', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', minWidth: 90,
  },
  roomPrice: { fontSize: 20, fontWeight: '700', color: '#7C5CFC' },
  roomPriceSub: { fontSize: 10, color: '#9CA3AF' },
  roomAvailable: { fontSize: 11, color: '#7C5CFC', marginTop: 4 },
  preparingTag: {
    marginTop: 4, backgroundColor: '#FFF7ED',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: '#FDBA74',
  },
  preparingTagText: { fontSize: 9, color: '#EA580C', fontWeight: '600' as const },
  roomDetailBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  roomDetailBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})