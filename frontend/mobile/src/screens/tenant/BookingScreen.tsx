import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

const MOCK_BOOKING = {
  propertyName: 'Purple Residence',
  roomName: 'Standard',
  rentPerMonth: 4500,
  bookingFee: 2000,
}

const MONTH_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const DAY_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function Calendar({ selectedDate, onSelect }: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
  }

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <View style={s.calendar}>
      <View style={s.calNavRow}>
        <TouchableOpacity onPress={prevMonth} style={s.calNavBtn}>
          <Ionicons name="chevron-back" size={18} color="#7C5CFC" />
        </TouchableOpacity>
        <Text style={s.calTitle}>{MONTH_TH[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.calNavBtn}>
          <Ionicons name="chevron-forward" size={18} color="#7C5CFC" />
        </TouchableOpacity>
      </View>

      <View style={s.calDayRow}>
        {DAY_TH.map(d => (
          <Text key={d} style={s.calDayLabel}>{d}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={s.calWeekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={s.calCell} />
            const past = isPast(day)
            const sel = isSelected(day)
            return (
              <TouchableOpacity
                key={di}
                style={[s.calCell, sel && s.calCellSelected, past && s.calCellPast]}
                onPress={() => {
                  if (past) return
                  if (!isSelected(day)) onSelect(new Date(viewYear, viewMonth, day))
                }}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text style={[s.calCellText, sel && s.calCellTextSelected, past && s.calCellTextPast]}>
                  {day}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

export default function BookingScreen() {
  const { id, propertyId } = useLocalSearchParams<{ id: string; propertyId: string }>()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const booking = MOCK_BOOKING

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${MONTH_TH[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(app)/(tenant)/room/[id]', params: { id, propertyId } } as any)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>จองห้องพัก</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.body}>

          <View style={s.roomCard}>
            <View style={s.roomCardLeft}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.roomPropName}>{booking.propertyName}</Text>
            </View>
            <Text style={s.roomName}>{booking.roomName}</Text>
            <View style={s.roomPriceRow}>
              <View>
                <Text style={s.roomPriceLabel}>ค่าเช่า/เดือน</Text>
                <Text style={s.roomPriceVal}>{booking.rentPerMonth.toLocaleString('th-TH')} ฿</Text>
              </View>
              <View>
                <Text style={s.roomPriceLabel}>ค่าจองห้อง</Text>
                <Text style={s.roomPriceVal}>{booking.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>เลือกวันที่เข้าอยู่</Text>
            </View>

            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />

            {selectedDate && (
              <View style={s.selectedDateBox}>
                <Ionicons name="calendar" size={14} color="#7C5CFC" />
                <Text style={s.selectedDateText}>วันเข้าอยู่: {formatDate(selectedDate)}</Text>
              </View>
            )}
          </View>

          {/* ปุ่มถัดไป */}
          <TouchableOpacity
            style={[s.nextBtn, !selectedDate && s.nextBtnDisabled]}
            disabled={!selectedDate}
            activeOpacity={0.85}
            onPress={() => router.push({
              pathname: '/(app)/(tenant)/booking-summary/[id]',
              params: { id, propertyId, moveInDate: selectedDate?.toISOString() }
            } as any)}
          >
            <Text style={s.nextBtnText}>ถัดไป →</Text>
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

  body: { padding: 16, gap: 16 },

  roomCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)',
  },
  roomCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  roomPropName: { fontSize: 11, color: '#7C5CFC' },
  roomName: { fontSize: 20, fontWeight: '700', color: '#7C5CFC', marginBottom: 12 },
  roomPriceRow: { flexDirection: 'row', gap: 32 },
  roomPriceLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  roomPriceVal: { fontSize: 16, fontWeight: '700', color: '#7C5CFC' },

  section: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionBar: { width: 4, height: 20, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },

  calendar: { padding: 16 },
  calNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calNavBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  calTitle: { fontSize: 15, fontWeight: '600', color: '#1F1D2E' },
  calDayRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  calWeekRow: { flexDirection: 'row', marginBottom: 4 },
  calCell: {
    flex: 1, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 18,
  },
  calCellSelected: { backgroundColor: '#7C5CFC' },
  calCellPast: { opacity: 0.3 },
  calCellText: { fontSize: 14, color: '#1F1D2E' },
  calCellTextSelected: { color: '#fff', fontWeight: '700' },
  calCellTextPast: { color: '#9CA3AF' },

  selectedDateBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EDE9FE', borderRadius: 10,
    padding: 10, marginHorizontal: 16, marginBottom: 16,
  },
  selectedDateText: { fontSize: 13, color: '#7C5CFC', fontWeight: '500' },

  nextBtn: {
    backgroundColor: '#7C5CFC', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#C4B5FD' },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})