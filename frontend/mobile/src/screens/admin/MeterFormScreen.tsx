import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { adminMeterApi } from '../../api/admin/adminMeterApi'
import type { RoomMeter } from '../../types/adminMeter.types'

type FilterTab = 'all' | 'done' | 'pending'

const MONTH_NAMES = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function RoomCard({
  item,
  onEdit,
}: {
  item: RoomMeter & { draft?: { electric: string; water: string } }
  onEdit: (room: RoomMeter) => void
}) {
  const hasMeter = item.electricMeter != null || item.draft?.electric
  const electric = item.draft?.electric ?? (item.electricMeter != null ? String(item.electricMeter) : null)
  const water = item.draft?.water ?? (item.waterMeter != null ? String(item.waterMeter) : null)

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.thumbnail}>
          <Ionicons name="bed-outline" size={22} color="#C4B5FD" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.roomLabel}>เลขห้อง</Text>
          <Text style={styles.roomNumber}>ห้อง {item.roomNumber}</Text>
          <View style={styles.metersRow}>
            <View style={styles.meterBox}>
              <Text style={styles.meterLabel}>ค่าไฟ (หน่วย)</Text>
              <Text style={[styles.meterValue, !electric && styles.meterEmpty]}>
                {electric ?? '–'}
              </Text>
            </View>
            <View style={styles.meterBox}>
              <Text style={styles.meterLabel}>ค่าน้ำ (หน่วย)</Text>
              <Text style={[styles.meterValue, !water && styles.meterEmpty]}>
                {water ?? '–'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function MeterFormScreen() {
  const { propertyId, propertyName } = useLocalSearchParams<{
    propertyId: string
    propertyName: string
  }>()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear() + 543 // พ.ศ.
  const yearAD = now.getFullYear()

  const [rooms, setRooms] = useState<RoomMeter[]>([])
  const [drafts, setDrafts] = useState<Record<string, { electric: string; water: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tab, setTab] = useState<FilterTab>('all')

  // Edit modal
  const [editRoom, setEditRoom] = useState<RoomMeter | null>(null)
  const [editElectric, setEditElectric] = useState('')
  const [editWater, setEditWater] = useState('')

  useEffect(() => {
    if (!propertyId) return
    adminMeterApi.getRooms(propertyId, month, yearAD)
      .then(setRooms)
      .catch(() => Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลห้องได้'))
      .finally(() => setIsLoading(false))
  }, [propertyId])

  const isDone = useCallback((room: RoomMeter) => {
    const d = drafts[room.id]
    return (d?.electric || room.electricMeter != null) && (d?.water || room.waterMeter != null)
  }, [drafts])

  const filteredRooms = rooms.filter((r) => {
    if (tab === 'done') return isDone(r)
    if (tab === 'pending') return !isDone(r)
    return true
  })

  const doneCount = rooms.filter(isDone).length
  const pendingCount = rooms.length - doneCount

  const openEdit = (room: RoomMeter) => {
    const d = drafts[room.id]
    setEditElectric(d?.electric ?? (room.electricMeter != null ? String(room.electricMeter) : ''))
    setEditWater(d?.water ?? (room.waterMeter != null ? String(room.waterMeter) : ''))
    setEditRoom(room)
  }

  const handleSaveEdit = () => {
    if (!editRoom) return
    setDrafts((prev) => ({
      ...prev,
      [editRoom.id]: { electric: editElectric, water: editWater },
    }))
    setEditRoom(null)
  }

  const handleSubmit = async () => {
    const toSave = rooms.filter((r) => {
      const d = drafts[r.id]
      return d?.electric && d?.water
    })
    if (toSave.length === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลมิเตอร์อย่างน้อย 1 ห้อง')
      return
    }
    setIsSaving(true)
    try {
      await Promise.all(
        toSave.map((r) =>
          adminMeterApi.saveMeter({
            roomId: r.id,
            month,
            year: yearAD,
            electricMeter: parseFloat(drafts[r.id].electric),
            waterMeter: parseFloat(drafts[r.id].water),
          })
        )
      )
      Alert.alert('สำเร็จ', `บันทึกมิเตอร์ ${toSave.length} ห้องเรียบร้อย`, [
        { text: 'ตกลง', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setIsSaving(false)
    }
  }

  const roomsWithDraft = filteredRooms.map((r) => ({
    ...r,
    draft: drafts[r.id],
  }))

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1F1D2E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ผลการอ่านมิเตอร์</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{propertyName}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C5CFC" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={roomsWithDraft}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoomCard item={item} onEdit={openEdit} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Month summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <View style={styles.summaryIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#7C5CFC" />
                  </View>
                  <View>
                    <Text style={styles.summaryMonth}>
                      รอบเดือน {MONTH_NAMES[month]} {year}
                    </Text>
                    <Text style={styles.summaryCount}>
                      จดแล้ว {doneCount}/{rooms.length} ห้อง
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRight}>
                  <Text style={styles.summaryPercent}>
                    {rooms.length > 0 ? Math.round((doneCount / rooms.length) * 100) : 0}%
                  </Text>
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabRow}>
                {([
                  { key: 'all', label: `ทั้งหมด (${rooms.length})` },
                  { key: 'done', label: `จดแล้ว (${doneCount})` },
                  { key: 'pending', label: `ยังไม่จด (${pendingCount})` },
                ] as { key: FilterTab; label: string }[]).map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                    onPress={() => setTab(t.key)}
                  >
                    <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AI badge */}
              <View style={styles.aiBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiTitle}>AI อ่านข้อมูลสำเร็จ</Text>
                  <Text style={styles.aiDesc}>
                    กรุณาตรวจสอบความถูกต้อง หากพบข้อผิดพลาดสามารถแก้ไขได้
                  </Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>ไม่มีห้องในหมวดนี้</Text>
          }
        />
      )}

      {/* Footer */}
      {!isLoading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>ยืนยันและส่งข้อมูล</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={!!editRoom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ห้อง {editRoom?.roomNumber}</Text>
              <TouchableOpacity onPress={() => setEditRoom(null)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>ค่าไฟ (หน่วย)</Text>
            <TextInput
              style={styles.input}
              value={editElectric}
              onChangeText={setEditElectric}
              placeholder="0"
              placeholderTextColor="#C4B5FD"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>ค่าน้ำ (หน่วย)</Text>
            <TextInput
              style={styles.input}
              value={editWater}
              onChangeText={setEditWater}
              placeholder="0"
              placeholderTextColor="#C4B5FD"
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F3FF',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E' },
  headerSub: { fontSize: 12, color: '#7C5CFC', marginTop: 1 },

  listContent: { padding: 16, paddingBottom: 32 },

  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F3FF', borderRadius: 16, padding: 14, marginBottom: 14,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  summaryMonth: { fontSize: 13, fontWeight: '600', color: '#1F1D2E' },
  summaryCount: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  summaryRight: {},
  summaryPercent: { fontSize: 22, fontWeight: '700', color: '#7C5CFC' },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F3FF', alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#7C5CFC' },
  tabText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  aiBadge: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 14,
  },
  aiTitle: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  aiDesc: { fontSize: 12, color: '#059669', marginTop: 2 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 10,
    padding: 14, borderWidth: 1, borderColor: '#F5F3FF',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: {
    width: 60, height: 60, borderRadius: 10,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  roomLabel: { fontSize: 11, color: '#9CA3AF' },
  roomNumber: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', marginBottom: 6 },
  metersRow: { flexDirection: 'row', gap: 16 },
  meterBox: {},
  meterLabel: { fontSize: 11, color: '#9CA3AF' },
  meterValue: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  meterEmpty: { color: '#D1D5DB' },

  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 32 },

  footer: {
    padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14, height: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1F1D2E' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#EDE9FE', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1F1D2E', marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
