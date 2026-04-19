import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useRef, useEffect } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { mobileBookingApi, type BookingInfo } from '../../api/booking/mobileBookingApi'

const MONTH_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const DAY_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function Calendar({ selectedDate, onSelect, minDate, maxDate }: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
  minDate: Date
  maxDate: Date
}) {
  const [viewYear, setViewYear] = useState(minDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(minDate.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const isBeforeMinMonth = viewYear < minDate.getFullYear() ||
    (viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth())
  const isAfterMaxMonth = viewYear > maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth())

  const prevMonth = () => {
    if (isBeforeMinMonth) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (isAfterMaxMonth) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
  }

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const min = new Date(minDate); min.setHours(0, 0, 0, 0)
    const max = new Date(maxDate); max.setHours(0, 0, 0, 0)
    return d < min || d > max
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
        <TouchableOpacity onPress={prevMonth} style={[s.calNavBtn, isBeforeMinMonth && { opacity: 0.3 }]}>
          <Ionicons name="chevron-back" size={18} color="#7C5CFC" />
        </TouchableOpacity>
        <Text style={s.calTitle}>{MONTH_TH[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={[s.calNavBtn, isAfterMaxMonth && { opacity: 0.3 }]}>
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
            const disabled = isDisabled(day)
            const sel = isSelected(day)
            return (
              <TouchableOpacity
                key={di}
                style={[s.calCell, sel && s.calCellSelected, disabled && s.calCellPast]}
                onPress={() => {
                  if (disabled) return
                  if (!isSelected(day)) onSelect(new Date(viewYear, viewMonth, day))
                }}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <Text style={[s.calCellText, sel && s.calCellTextSelected, disabled && s.calCellTextPast]}>
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
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!id || !propertyId) return
    mobileBookingApi.getBookingInfo(propertyId as string, id as string)
      .then(setBookingInfo)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, propertyId])

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }, [])
  )

  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ActivityIndicator color="#7C5CFC" style={{ marginTop: 80 }} />
    </SafeAreaView>
  )

  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const minDateRaw = bookingInfo?.minMoveInDate
    ? (() => { const [y,m,d] = bookingInfo.minMoveInDate.split('-').map(Number); return new Date(y, m-1, d) })()
    : tomorrow
  const minDate = minDateRaw < tomorrow ? tomorrow : minDateRaw
  const maxDate = bookingInfo?.maxMoveInDate
    ? (() => { const [y,m,d] = bookingInfo.maxMoveInDate.split('-').map(Number); return new Date(y, m-1, d) })()
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45)

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${MONTH_TH[date.getMonth()]} ${date.getFullYear()}`
  }

  const monthlyRent = (bookingInfo?.roomPrice ?? 0) + (bookingInfo?.furniturePrice ?? 0)

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

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.body}>

          <View style={s.roomCard}>
            <View style={s.roomCardLeft}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.roomPropName}>{bookingInfo?.propertyName}</Text>
            </View>
            <Text style={s.roomName}>{bookingInfo?.roomTypeName}</Text>
            <View style={s.roomPriceRow}>
              <View>
                <Text style={s.roomPriceLabel}>ค่าเช่า/เดือน</Text>
                <Text style={s.roomPriceVal}>{monthlyRent.toLocaleString('th-TH')} ฿</Text>
              </View>
              <View>
                <Text style={s.roomPriceLabel}>ค่าจองห้อง</Text>
                <Text style={s.roomPriceVal}>{bookingInfo?.bookingFee.toLocaleString('th-TH')} ฿</Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>เลือกวันที่เข้าอยู่</Text>
            </View>

            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} minDate={minDate} maxDate={maxDate} />

            {selectedDate && (
              <View style={s.selectedDateBox}>
                <Ionicons name="calendar" size={14} color="#7C5CFC" />
                <Text style={s.selectedDateText}>วันเข้าอยู่: {formatDate(selectedDate)}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[s.nextBtn, !selectedDate && s.nextBtnDisabled]}
            disabled={!selectedDate}
            activeOpacity={0.85}
            onPress={() => router.push({
              pathname: '/(app)/(tenant)/booking-summary/[id]',
              params: { id, propertyId, moveInDate: selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}` : undefined }
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
  safe: { flex: 1, backgroundColor: '#7C5CFC' },
  header: {
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { padding: 16, gap: 16 },
  roomCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)',
  },
  roomCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  roomPropName: { fontSize: 11, color: '#7C5CFC' },
  roomName: { fontSize: 20, fontWeight: '700', color: '#7C5CFC', marginBottom: 12 },
  roomPriceRow: { flexDirection: 'row', gap: 32 },
  roomPriceLabel: { fontSize: 11, color: '#7C5CFC', marginBottom: 4 },
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
  calCell: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
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