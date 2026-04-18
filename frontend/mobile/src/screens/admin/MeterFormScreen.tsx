import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { adminMeterApi } from '../../api/admin/adminMeterApi'
import type { RoomMeter } from '../../types/adminMeter.types'
import { aiMeterStore } from '../../store/aiMeterStore'

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
  const { propertyId, propertyName, month: monthParam, year: yearParam } = useLocalSearchParams<{
    propertyId: string
    propertyName: string
    month?: string
    year?: string
  }>()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(monthParam ? parseInt(monthParam) : now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(yearParam ? parseInt(yearParam) : now.getFullYear())

  const year = selectedYear + 543
  const yearAD = selectedYear

  const isNextMonthFuture = (m: number, y: number) => y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1)

  const changeMonth = (delta: number) => {
    setSelectedMonth(prev => {
      let m = prev + delta
      let y = selectedYear
      if (m < 1) { m = 12; y = y - 1; setSelectedYear(y) }
      else if (m > 12) { m = 1; y = y + 1; setSelectedYear(y) }
      if (isNextMonthFuture(m, y)) return prev
      return m
    })
  }

  const [rooms, setRooms] = useState<RoomMeter[]>([])
  const [drafts, setDrafts] = useState<Record<string, { electric: string; water: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tab, setTab] = useState<FilterTab>('all')

  // Edit modal
  const [editRoom, setEditRoom] = useState<RoomMeter | null>(null)
  const [editElectric, setEditElectric] = useState('')
  const [editWater, setEditWater] = useState('')

  useFocusEffect(
    useCallback(() => {
      if (!propertyId) return
      setDrafts({})
      setIsLoading(true)
      const loadData = async () => {
        await aiMeterStore.load()
        const data = await adminMeterApi.getRooms(propertyId, selectedMonth, yearAD)
        setRooms(data)
        const aiDrafts = aiMeterStore.drafts
        if (Object.keys(aiDrafts).length > 0) {
          const initial: Record<string, { electric: string; water: string }> = {}
          for (const room of data) {
            const ai = aiMeterStore.getForRoom(room.roomNumber)
            if (ai && (ai.electric || ai.water)) {
              initial[room.id] = { electric: ai.electric, water: ai.water }
            }
          }
          if (Object.keys(initial).length > 0) setDrafts(initial)
        }
      }
      loadData()
        .catch(() => Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลห้องได้'))
        .finally(() => setIsLoading(false))
    }, [propertyId, selectedMonth, selectedYear])
  )

  const isDone = useCallback((room: RoomMeter) => {
    const d = drafts[room.id]
    return (d?.electric || room.electricMeter != null) && (d?.water || room.waterMeter != null)
  }, [drafts])

  const filteredRooms = rooms
    .filter((r) => {
      if (tab === 'done') return isDone(r)
      if (tab === 'pending') return !isDone(r)
      return true
    })
    .sort((a, b) => {
      const na = parseInt(a.roomNumber)
      const nb = parseInt(b.roomNumber)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.roomNumber.localeCompare(b.roomNumber)
    })

  const doneCount = rooms.filter(isDone).length
  const pendingCount = rooms.length - doneCount
  const aiFilledCount = Object.keys(drafts).length

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
    aiMeterStore.setForRoom(editRoom.roomNumber, { electric: editElectric, water: editWater })
    setEditRoom(null)
  }

  const handleSubmit = async () => {
    // รวม draft กับค่า DB ที่มีอยู่: ใช้ draft ก่อน ถ้าไม่มีใช้ค่าใน DB
    const toSave = rooms.filter((r) => {
      const d = drafts[r.id]
      const electric = d?.electric || (r.electricMeter != null ? String(r.electricMeter) : null)
      const water = d?.water || (r.waterMeter != null ? String(r.waterMeter) : null)
      // บันทึกเฉพาะห้องที่มีการเปลี่ยนแปลง (draft) และครบทั้งสองค่า
      return (d?.electric || d?.water) && electric != null && water != null
    })
    if (toSave.length === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลมิเตอร์อย่างน้อย 1 ห้อง')
      return
    }
    setIsSaving(true)
    try {
      await Promise.all(
        toSave.map((r) => {
          const d = drafts[r.id]
          const electric = d?.electric || String(r.electricMeter)
          const water = d?.water || String(r.waterMeter)
          return adminMeterApi.saveMeter({
            roomId: r.id,
            month: selectedMonth,
            year: yearAD,
            electricMeter: parseFloat(electric),
            waterMeter: parseFloat(water),
          })
        })
      )
      await aiMeterStore.clear()
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
          style={{ flex: 1, backgroundColor: '#fff' }}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Month picker */}
              <View style={styles.monthPickerRow}>
                <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Ionicons name="chevron-back" size={20} color="#7C5CFC" />
                </TouchableOpacity>
                <Text style={styles.monthPickerText}>{MONTH_NAMES[selectedMonth]} {year}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
                  <Ionicons name="chevron-forward" size={20} color="#7C5CFC" />
                </TouchableOpacity>
              </View>

              {/* Month summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                  <View style={styles.summaryIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#7C5CFC" />
                  </View>
                  <View>
                    <Text style={styles.summaryMonth}>
                      รอบเดือน {MONTH_NAMES[selectedMonth]} {year}
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
              {aiFilledCount > 0 ? (
                <View style={styles.aiBadge}>
                  <Ionicons name="sparkles" size={16} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiTitle}>AI อ่านข้อมูลสำเร็จ {aiFilledCount} ห้อง</Text>
                    <Text style={styles.aiDesc}>
                      กรุณาตรวจสอบความถูกต้อง หากพบข้อผิดพลาดสามารถแก้ไขได้
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.aiBadge, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="create-outline" size={16} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.aiTitle, { color: '#92400E' }]}>กรอกข้อมูลด้วยตนเอง</Text>
                    <Text style={[styles.aiDesc, { color: '#D97706' }]}>
                      กดปุ่มดินสอที่การ์ดห้องเพื่อกรอกค่ามิเตอร์
                    </Text>
                  </View>
                </View>
              )}
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
  safe: { flex: 1, backgroundColor: '#7C5CFC' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F3FF',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E' },
  headerSub: { fontSize: 12, color: '#7C5CFC', marginTop: 1 },

  listContent: { padding: 16, paddingBottom: 32 },

  monthPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    marginBottom: 12,
  },
  monthPickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1D2E',
    minWidth: 150,
    textAlign: 'center',
  },

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
