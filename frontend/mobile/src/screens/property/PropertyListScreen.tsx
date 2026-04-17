import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { Property } from '../../types/property.types'

export interface PropertyListScreenProps {
  properties: Property[]
  isLoading: boolean
  onSelectProperty: (propertyId: string) => void
}

export default function PropertyListScreen({ properties, isLoading, onSelectProperty }: PropertyListScreenProps) {
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C5CFC" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>สถานที่ของฉัน</Text>
          <Text style={styles.headerSub}>{properties.length} สถานที่</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(app)/properties/create' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>เพิ่มสถานที่</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={properties}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, properties.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: '#fff' }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="business-outline" size={32} color="#C4B5FD" />
            </View>
            <Text style={styles.emptyTitle}>ยังไม่มีสถานที่</Text>
            <Text style={styles.emptySub}>กด "เพิ่มสถานที่" เพื่อเริ่มต้น</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/(app)/properties/create' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#7C5CFC" />
              <Text style={styles.emptyAddText}>เพิ่มสถานที่แรก</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectProperty(item.id)}
            activeOpacity={0.7}
          >
            {/* Icon */}
            <View style={styles.cardIcon}>
              <Ionicons name="business" size={22} color="#7C5CFC" />
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardAddr} numberOfLines={1}>{item.address}</Text>
              <View style={styles.cardStats}>
                <StatChip icon="bed-outline" value={item.totalRooms} label="ห้อง" />
                <StatChip icon="checkmark-circle-outline" value={item.occupied} label="มีผู้เช่า" color="#10B981" />
                <StatChip icon="time-outline" value={item.available} label="ว่าง" color="#F59E0B" />
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

function StatChip({ icon, value, label, color = '#7C5CFC' }: {
  icon: any; value: number; label: string; color?: string
}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.chipText, { color }]}>{value} {label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#7C5CFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#7C5CFC', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  list: { padding: 16, gap: 10 },
  listEmpty: { flex: 1 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#F0F0F5',
    shadowColor: '#7C5CFC', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  cardIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardAddr: { fontSize: 12, color: '#9CA3AF', marginBottom: 6 },
  cardStats: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  chipText: { fontSize: 11, fontWeight: '500' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginBottom: 20 },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#7C5CFC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  emptyAddText: { fontSize: 14, fontWeight: '600', color: '#7C5CFC' },
})
