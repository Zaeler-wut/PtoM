import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import { adminMeterApi } from '../../api/admin/adminMeterApi'
import type { AdminPropertyCard } from '../../types/adminMeter.types'

function RoomTypeChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  )
}

function PropertyCard({ item }: { item: AdminPropertyCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="business-outline" size={28} color="#C4B5FD" />
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="bed-outline" size={13} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.totalRooms} ห้อง</Text>
          </View>
          <View style={styles.chipsRow}>
            {item.roomTypeNames.map((name, i) => (
              <RoomTypeChip key={i} label={name} />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.meterBtn}
        activeOpacity={0.85}
        onPress={() => router.push(`/(app)/(admin)/meter/${item.id}` as any)}
      >
        <Ionicons name="camera-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.meterBtnText}>บันทึกมิเตอร์</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function MeterListScreen() {
  const [properties, setProperties] = useState<AdminPropertyCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminMeterApi.getProperties()
      .then(setProperties)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const totalRooms = properties.reduce((sum, p) => sum + p.totalRooms, 0)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={['#9B6DFF', '#6C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>แอดมิน</Text>
            <Text style={styles.headerSub}>ผู้จัดการหอพัก</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{properties.length}</Text>
            <Text style={styles.statLabel}>สถานที่ทั้งหมด</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalRooms}</Text>
            <Text style={styles.statLabel}>ห้องทั้งหมด</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>สถานที่ทั้งหมด</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C5CFC" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PropertyCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ไม่พบสถานที่ที่คุณดูแล</Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 14, color: '#DDD6FE', marginTop: 2 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#DDD6FE', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },

  sectionRow: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F1D2E' },

  listContent: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardRow: { flexDirection: 'row', marginBottom: 12 },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },

  meterBtn: {
    backgroundColor: '#7C5CFC',
    borderRadius: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
})
