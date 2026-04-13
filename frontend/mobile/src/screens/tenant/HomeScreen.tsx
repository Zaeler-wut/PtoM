import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView, Modal, Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useRef } from 'react'
import { router } from 'expo-router'
import * as Location from 'expo-location'

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}
import { mobilePropertyApi } from '../../api/property/mobilePropertyApi'
import type { MobilePropertyCard } from '../../types/mobileProperty.types'

function formatPrice(n: number) {
  return n.toLocaleString('th-TH')
}

function FacilityChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  )
}

function PropertyCard({ item, onPress }: { item: MobilePropertyCard; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>ไม่มีรูปภาพ</Text>
          </View>
        )}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeText}>ใช้ระบบจองออนไลน์</Text>
          </View>
          <View style={[styles.badge, styles.badgePurple]}>
            <Text style={styles.badgeText}>ว่าง {item.availableRooms + item.preparingCount} ห้อง</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressPin}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
          {item.distanceKm > 0 && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={10} color="#7C5CFC" />
              <Text style={styles.distanceText}>
                {item.distanceKm < 1
                  ? `${Math.round(item.distanceKm * 1000)} ม.`
                  : `${item.distanceKm} กม.`}
              </Text>
            </View>
          )}
        </View>

        {item.facilities.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilitiesRow}>
            {item.facilities.map((f, i) => <FacilityChip key={i} label={f} />)}
          </ScrollView>
        )}

        {item.contractTerm && (
          <View>
            <View style={styles.contractRow}>
              <Ionicons name="document-text-outline" size={16} color="#7C5CFC" />
              <Text style={styles.contractTerm}>สัญญาเช่า: {item.contractTerm}</Text>
            </View>
            <View style={styles.contractDivider} />
          </View>
        )}

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceText}>
              {formatPrice(item.priceMin)} – {formatPrice(item.priceMax)}{' '}
              <Text style={styles.priceCurrency}>฿</Text>
            </Text>
            <Text style={styles.pricePerMonth}>ต่อเดือน</Text>
          </View>
          <View style={styles.totalRoomsBox}>
            <Text style={styles.totalRooms}>ทั้งหมด {item.totalRooms} ห้อง</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const THAI_MONTHS_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const DAY_LABELS = ['อา','จ','อ','พ','พฤ','ศ','ส']

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function HomeScreen() {
  const [properties, setProperties] = useState<MobilePropertyCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [selectedPeople, setSelectedPeople] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showPeopleModal, setShowPeopleModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calView, setCalView] = useState(new Date()) // เดือน/ปีที่แสดงในปฏิทิน
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null)

  const getDateParams = (date?: Date | null) => {
    const d = date !== undefined ? date : selectedDate
    const now = new Date()
    const ref = d ?? now
    return {
      month: ref.getMonth() + 1,
      year: ref.getFullYear(),
      day: ref.getDate(),
    }
  }

  const fetchByCoords = async (lat: number, lng: number, overrideDate?: Date | null, overridePeople?: number | null) => {
    coordsRef.current = { lat, lng }
    const date = overrideDate !== undefined ? overrideDate : selectedDate
    const people = overridePeople !== undefined ? overridePeople : selectedPeople
    const { month, year, day } = getDateParams(date)
    try {
      const data = await mobilePropertyApi.search({ lat, lng, month, year, day, radius: 100, maxOccupants: people ?? undefined })
      if (data.length > 0) {
        setProperties(data)
      } else {
        const featured = await mobilePropertyApi.getFeatured()
        setProperties(featured)
      }
    } catch {
      const featured = await mobilePropertyApi.getFeatured()
      setProperties(featured)
    }
  }

  const handleSearch = async () => {
    setSuggestions([])
    if (coordsRef.current) {
      setIsLoading(true)
      await fetchByCoords(coordsRef.current.lat, coordsRef.current.lng)
      setIsLoading(false)
      return
    }
    if (!location.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=th`,
        { headers: { 'Accept-Language': 'th' } }
      )
      const data: Suggestion[] = await res.json()
      if (data.length > 0) {
        await fetchByCoords(parseFloat(data[0].lat), parseFloat(data[0].lon))
      }
    } catch {}
    setIsLoading(false)
  }

  const handleGetLocation = async () => {
    setIsLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocation('ไม่ได้รับอนุญาตเข้าถึงตำแหน่ง')
        const data = await mobilePropertyApi.getFeatured()
        setProperties(data)
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const { latitude, longitude } = pos.coords
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (place) {
        const label = [place.district, place.city, place.region].filter(Boolean).join(', ')
        setLocation(label)
      }
      await fetchByCoords(latitude, longitude)
    } catch {
      setLocation('ไม่สามารถระบุตำแหน่งได้')
      const data = await mobilePropertyApi.getFeatured()
      setProperties(data)
    } finally {
      setIsLocating(false)
      setIsLoading(false)
    }
  }

  const handleLocationChange = (text: string) => {
    setLocation(text)
    setSuggestions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.length < 2) return
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=th`,
          { headers: { 'Accept-Language': 'th' } }
        )
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
      } catch {}
    }, 400)
  }

  const handleSelectSuggestion = async (s: Suggestion) => {
    setLocation(s.display_name.split(',').slice(0, 2).join(',').trim())
    setSuggestions([])
    setIsLoading(true)
    await fetchByCoords(parseFloat(s.lat), parseFloat(s.lon))
    setIsLoading(false)
  }

  useEffect(() => {
    handleGetLocation()
  }, [])

  const ListHeader = (
    <>
      <LinearGradient
        colors={['#9B6DFF', '#6C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientWrapper}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ห้องพักรายเดือน</Text>
          <Text style={styles.headerSub}>ที่คุณถูกใจ</Text>
        </View>

        <View style={styles.searchCard}>
          <View>
            <View style={styles.searchField}>
              <Ionicons name="location-outline" size={18} color="#7C5CFC" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="สถานที่ ที่อยู่ที่พัก"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={handleLocationChange}
              />
              <TouchableOpacity onPress={handleGetLocation} disabled={isLocating} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {isLocating
                  ? <ActivityIndicator size="small" color="#7C5CFC" />
                  : <Ionicons name="navigate-outline" size={18} color="#7C5CFC" />
                }
              </TouchableOpacity>
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                    onPress={() => handleSelectSuggestion(s)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={14} color="#7C5CFC" style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {s.display_name.split(',').slice(0, 3).join(',')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.searchRow}>
            {/* วันที่เข้าอยู่ */}
            <TouchableOpacity
              style={[styles.searchField, { flex: 1, marginRight: 8 }]}
              onPress={() => { setCalView(selectedDate ?? new Date()); setShowCalendar(true) }}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color="#7C5CFC" style={styles.searchIcon} />
              <Text style={[styles.searchInput, { color: selectedDate ? '#1F1D2E' : '#9CA3AF' }]}>
                {selectedDate
                  ? `${selectedDate.getDate()} ${THAI_MONTHS_SHORT[selectedDate.getMonth()]} ${selectedDate.getFullYear() + 543}`
                  : 'วันที่เข้าอยู่'}
              </Text>
            </TouchableOpacity>

            {/* จำนวนคน */}
            <TouchableOpacity
              style={[styles.searchField, { flex: 1 }]}
              onPress={() => setShowPeopleModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="person-outline" size={18} color="#7C5CFC" style={styles.searchIcon} />
              <Text style={[styles.searchInput, { color: selectedPeople ? '#1F1D2E' : '#9CA3AF' }]}>
                {selectedPeople ? `${selectedPeople} คน` : 'จำนวนคน'}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>ค้นหาที่พัก</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>ที่พักแนะนำ</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>ดูทั้งหมด</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator color="#7C5CFC" style={{ marginTop: 24 }} />}
    </>
  )

  // ── helpers สำหรับ calendar ──
  const calYear = calView.getFullYear()
  const calMonth = calView.getMonth()
  const calDays = buildCalendarDays(calYear, calMonth)
  const today = new Date()

  const goCalPrev = () => setCalView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))
  const goCalNext = () => setCalView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))

  const onSelectDay = (day: number) => {
    const picked = new Date(calYear, calMonth, day)
    setSelectedDate(picked)
    setShowCalendar(false)
    if (coordsRef.current) {
      setIsLoading(true)
      fetchByCoords(coordsRef.current.lat, coordsRef.current.lng, picked, selectedPeople).then(() => setIsLoading(false))
    }
  }

  const onClearDate = () => {
    setSelectedDate(null)
    setShowCalendar(false)
    if (coordsRef.current) {
      setIsLoading(true)
      fetchByCoords(coordsRef.current.lat, coordsRef.current.lng, null, selectedPeople).then(() => setIsLoading(false))
    }
  }

  const onSelectPeople = (n: number | null) => {
    setSelectedPeople(n)
    setShowPeopleModal(false)
    if (coordsRef.current) {
      setIsLoading(true)
      fetchByCoords(coordsRef.current.lat, coordsRef.current.lng, selectedDate, n).then(() => setIsLoading(false))
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={isLoading ? [] : properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            onPress={() => router.push(`/(app)/(tenant)/property/${item.id}` as any)}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>ไม่พบที่พักในขณะนี้</Text> : null
        }
      />

      {/* ── People Modal ── */}
      <Modal visible={showPeopleModal} transparent animationType="fade" onRequestClose={() => setShowPeopleModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPeopleModal(false)}>
          <View style={styles.peopleSheet}>
            <Text style={styles.sheetTitle}>จำนวนคน</Text>
            {[1, 2, 3, 4].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.peopleOption, selectedPeople === n && styles.peopleOptionActive]}
                onPress={() => onSelectPeople(n)}
                activeOpacity={0.8}
              >
                <Text style={[styles.peopleOptionText, selectedPeople === n && styles.peopleOptionTextActive]}>
                  {n} คน
                </Text>
                {selectedPeople === n && <Ionicons name="checkmark" size={16} color="#7C5CFC" />}
              </TouchableOpacity>
            ))}
            {selectedPeople && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => onSelectPeople(null)}>
                <Text style={styles.clearBtnText}>ล้างการเลือก</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* ── Calendar Modal ── */}
      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
          <Pressable style={styles.calSheet} onPress={() => {}}>
            {/* header: เดือน/ปี + nav */}
            <View style={styles.calYearRow}>
              <TouchableOpacity onPress={goCalPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="chevron-back" size={20} color="#7C5CFC" />
              </TouchableOpacity>
              <Text style={styles.calYearText}>
                {THAI_MONTHS_FULL[calMonth]} {calYear + 543}
              </Text>
              <TouchableOpacity onPress={goCalNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="chevron-forward" size={20} color="#7C5CFC" />
              </TouchableOpacity>
            </View>

            {/* day-of-week headers */}
            <View style={styles.calDayHeaderRow}>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={styles.calDayHeader}>{d}</Text>
              ))}
            </View>

            {/* day grid */}
            <View style={styles.calGrid}>
              {calDays.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={styles.calCell} />
                const cellDate = new Date(calYear, calMonth, day)
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const isPast = cellDate < todayStart
                const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                const isSelected = selectedDate
                  ? day === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear()
                  : false
                return (
                  <TouchableOpacity
                    key={`d-${i}`}
                    style={[styles.calCell, isSelected && styles.calCellActive, isToday && !isSelected && styles.calCellToday, isPast && styles.calCellPast]}
                    onPress={() => !isPast && onSelectDay(day)}
                    activeOpacity={isPast ? 1 : 0.8}
                  >
                    <Text style={[styles.calCellText, isSelected && styles.calCellTextActive, isToday && !isSelected && styles.calCellTextToday, isPast && styles.calCellTextPast]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {selectedDate && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClearDate}>
                <Text style={styles.clearBtnText}>ล้างการเลือก</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 22, fontWeight: '700', color: '#DDD6FE', marginBottom: 16 },

  listContent: { backgroundColor: '#F5F3FF', paddingBottom: 24 },
  gradientWrapper: { paddingBottom: 20 },

  searchCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16,
    shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  searchField: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F3FF', borderRadius: 12,
    paddingHorizontal: 12, height: 46, marginBottom: 10,
  },
  searchRow: { flexDirection: 'row', marginBottom: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#1F1D2E' },
  searchBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 12,
    height: 46, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  body: { flex: 1, backgroundColor: '#F5F3FF', paddingTop: 36, paddingHorizontal: 16 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F3FF', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F1D2E' },
  sectionLink: { fontSize: 13, color: '#7C5CFC', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },

  card: {
    backgroundColor: '#fff', borderRadius: 20,
    marginBottom: 16, marginHorizontal: 16, overflow: 'hidden',
    shadowColor: '#7C5CFC', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  imageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 180 },
  imagePlaceholder: { backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: '#9CA3AF', fontSize: 12 },
  badgeRow: {
    position: 'absolute', top: 10, left: 10, right: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeGreen: { backgroundColor: '#059669' },
  badgePurple: { backgroundColor: '#7C5CFC' },
  badgeOrange: { backgroundColor: '#EA580C' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1F1D2E', marginBottom: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  addressPin: { fontSize: 12, marginRight: 4 },
  addressText: { flex: 1, fontSize: 12, color: '#6B7280' },
  facilitiesRow: { marginBottom: 8 },
  chip: {
    backgroundColor: '#EDE9FE', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 6,
  },
  chipText: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },

  contractRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: 8, backgroundColor: '#F5F3FF',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  contractTerm: { fontSize: 12, color: '#1F1D2E', fontWeight: '400' },
  contractDivider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 10 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 20, fontWeight: '700', color: '#7C5CFC' },
  priceCurrency: { fontWeight: '400' },
  pricePerMonth: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  totalRoomsBox: {
    backgroundColor: '#F5F3FF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  totalRooms: { fontSize: 11, color: '#7C5CFC', fontWeight: '600' },
  distance: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EDE9FE', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6, flexShrink: 0,
  },
  distanceText: { fontSize: 10, color: '#7C5CFC', fontWeight: '600' },

  // ── Modals ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  peopleSheet: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%',
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12 },
  peopleOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    marginBottom: 6, backgroundColor: '#F5F3FF',
  },
  peopleOptionActive: { backgroundColor: '#EDE9FE', borderWidth: 1.5, borderColor: '#7C5CFC' },
  peopleOptionText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  peopleOptionTextActive: { color: '#7C5CFC', fontWeight: '700' },
  clearBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 10 },
  clearBtnText: { fontSize: 13, color: '#9CA3AF' },

  // ── Calendar ──
  calSheet: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%',
  },
  calYearRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  calYearText: { fontSize: 16, fontWeight: '700', color: '#111' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 999, marginVertical: 2,
  },
  calCellActive: { backgroundColor: '#7C5CFC' },
  calDayHeaderRow: { flexDirection: 'row', marginBottom: 6 },
  calDayHeader: { flex: 1, textAlign: 'center', fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  calCellToday: { borderWidth: 1.5, borderColor: '#7C5CFC' },
  calCellText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  calCellTextActive: { color: '#fff', fontWeight: '700' },
  calCellTextToday: { color: '#7C5CFC', fontWeight: '700' },
  calCellPast: { opacity: 0.3 },
  calCellTextPast: {},

  suggestionBox: {
    backgroundColor: '#fff', borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: '#EDE9FE', overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  suggestionText: { flex: 1, fontSize: 12, color: '#1F1D2E' },
})