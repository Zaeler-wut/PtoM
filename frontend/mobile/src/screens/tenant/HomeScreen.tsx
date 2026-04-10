import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView,
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
            <Text style={styles.badgeText}>ว่าง {item.availableRooms} ห้อง</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.addressRow}>
          <Text style={styles.addressPin}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
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

export default function HomeScreen() {
  const [properties, setProperties] = useState<MobilePropertyCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [people, setPeople] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchByCoords = async (lat: number, lng: number) => {
    const now = new Date()
    try {
      const data = await mobilePropertyApi.search({
        lat, lng,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        radius: 100,
      })
      setProperties(data)
    } catch {
      const data = await mobilePropertyApi.getFeatured()
      setProperties(data)
    }
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
            <View style={[styles.searchField, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="calendar-outline" size={18} color="#7C5CFC" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="เดือนที่เข้าอยู่"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.searchField, { flex: 1 }]}>
              <Ionicons name="person-outline" size={18} color="#7C5CFC" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="จำนวนคน"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={people}
                onChangeText={setPeople}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85}>
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