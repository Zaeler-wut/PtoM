import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { readMetersFromImages } from '../../lib/geminiService'
import { aiMeterStore } from '../../store/aiMeterStore'

interface PickedImage {
  uri: string
  base64: string
}

function UploadBox({
  label,
  icon,
  images,
  onPick,
  onRemove,
}: {
  label: string
  icon: 'flash-outline' | 'water-outline'
  images: PickedImage[]
  onPick: () => void
  onRemove: (index: number) => void
}) {
  return (
    <View style={styles.uploadSection}>
      <View style={styles.uploadHeader}>
        <Ionicons name={icon} size={18} color={icon === 'flash-outline' ? '#F59E0B' : '#3B82F6'} />
        <Text style={styles.uploadLabel}>{label}</Text>
      </View>

      {images.length > 0 ? (
        <View style={styles.previewRow}>
          {images.map((img, i) => (
            <View key={i} style={styles.previewWrapper}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(i)}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreBtn} onPress={onPick}>
            <Ionicons name="add" size={24} color="#7C5CFC" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={onPick} activeOpacity={0.8}>
          <Ionicons name="cloud-upload-outline" size={36} color="#C4B5FD" />
          <Text style={styles.uploadBoxHint}>JPG, PNG • เลือกได้ไม่จำกัด</Text>
          <View style={styles.pickBtn}>
            <Ionicons name="images-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.pickBtnText}>เลือกรูปภาพ</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

const MONTH_NAMES = [
  '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

export default function MeterUploadScreen() {
  const { propertyId, propertyName } = useLocalSearchParams<{
    propertyId: string
    propertyName: string
  }>()

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [electricImages, setElectricImages] = useState<PickedImage[]>([])
  const [waterImages, setWaterImages] = useState<PickedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressDone, setProgressDone] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)

  const changeMonth = (delta: number) => {
    setSelectedMonth(prev => {
      let m = prev + delta
      let y = selectedYear
      if (m < 1) { m = 12; y = y - 1; setSelectedYear(y) }
      else if (m > 12) { m = 1; y = y + 1; setSelectedYear(y) }
      if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1)) return prev
      return m
    })
  }

  const pickImages = async (setter: (imgs: PickedImage[]) => void, current: PickedImage[]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงรูปภาพ')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 1,
      base64: false,
    })
    if (!result.canceled) {
      const picked: PickedImage[] = (
        await Promise.all(
          result.assets.map(async (a) => {
            // normalize EXIF orientation + compress
            const ctx = ImageManipulator.manipulate(a.uri)
            const ref = await ctx.renderAsync()
            const manipulated = await ref.saveAsync({ compress: 0.7, format: SaveFormat.JPEG, base64: true })
            return manipulated.base64 ? { uri: manipulated.uri, base64: manipulated.base64 } : null
          })
        )
      ).filter((x): x is PickedImage => x !== null)
      setter([...current, ...picked])
    }
  }

  // กรอกมิเตอร์เอง — ไม่ล้าง aiMeterStore เพื่อคงข้อมูล AI ที่อ่านไว้แล้ว
  const handleManual = () => {
    router.push({
      pathname: '/(app)/(admin)/meter/readings' as any,
      params: { propertyId, propertyName, month: selectedMonth, year: selectedYear },
    })
  }

  // ให้ AI อ่าน
  const handleAiRead = async () => {
    const totalImages = electricImages.length + waterImages.length
    if (totalImages === 0) return

    setIsProcessing(true)
    setProgressDone(0)
    setProgressTotal(totalImages)
    try {
      const results = await readMetersFromImages(
        electricImages,
        waterImages,
        (done, total) => { setProgressDone(done); setProgressTotal(total) },
      )
      await aiMeterStore.load()
      await aiMeterStore.set(results)
      // ลบรูปออกหลังอ่านเสร็จ — ข้อมูลถูกบันทึกใน storage แล้ว
      setElectricImages([])
      setWaterImages([])

      const failed = results
        .map((r, i) => {
          if (r.roomNumber == null || r.meterValue == null) {
            const isElectric = i < electricImages.length
            const idx = isElectric ? i + 1 : i - electricImages.length + 1
            const typeLabel = isElectric ? 'ไฟฟ้า' : 'น้ำ'
            return r.roomNumber
              ? `มิเตอร์${typeLabel}ห้อง ${r.roomNumber}`
              : `มิเตอร์${typeLabel}รูปที่ ${idx} (อ่านเลขห้องไม่ได้)`
          }
          return null
        })
        .filter(Boolean)

      if (failed.length === results.length) {
        Alert.alert(
          'AI อ่านไม่ได้',
          'ไม่สามารถอ่านข้อมูลจากรูปได้ทั้งหมด กรุณากรอกด้วยตนเอง',
          [{ text: 'ตกลง', onPress: handleManual }]
        )
      } else if (failed.length > 0) {
        Alert.alert(
          'AI อ่านไม่ได้บางรูป',
          `อ่านไม่ได้: ${failed.join(', ')}\nกรุณากรอกส่วนที่เหลือด้วยตนเอง`,
          [{ text: 'ตกลง', onPress: handleManual }]
        )
      } else {
        handleManual()
      }
    } catch (e: any) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        `ไม่สามารถเชื่อมต่อ AI ได้: ${e.message}\nกรุณากรอกด้วยตนเอง`,
        [{ text: 'ตกลง', onPress: handleManual }]
      )
    } finally {
      setIsProcessing(false)
      }
  }

  const handleClearAll = () => {
    Alert.alert('ล้างรูปทั้งหมด', 'ต้องการลบรูปมิเตอร์ทั้งหมดใช่ไหม?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ล้างทั้งหมด', style: 'destructive', onPress: () => { setElectricImages([]); setWaterImages([]) } },
    ])
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1F1D2E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>อัปโหลดรูปมิเตอร์</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{propertyName}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Month picker */}
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={20} color="#7C5CFC" />
          </TouchableOpacity>
          <Text style={styles.monthPickerText}>
            {MONTH_NAMES[selectedMonth]} {selectedYear + 543}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
            <Ionicons name="chevron-forward" size={20} color="#7C5CFC" />
          </TouchableOpacity>
        </View>

        {/* AI badge */}
        <View style={styles.aiBadge}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#7C5CFC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI อ่านมิเตอร์อัตโนมัติ</Text>
            <Text style={styles.aiDesc}>
              ถ่ายรูปมิเตอร์พร้อมป้ายเลขห้อง AI จะอ่านค่าและกรอกข้อมูลให้อัตโนมัติ
              อัปโหลดได้ไม่จำกัดจำนวน ระบบจะประมวลผลทีละชุดให้อัตโนมัติ
            </Text>
          </View>
        </View>

        <UploadBox
          label="มิเตอร์ไฟฟ้า"
          icon="flash-outline"
          images={electricImages}
          onPick={() => pickImages(setElectricImages, electricImages)}
          onRemove={(i) => setElectricImages(prev => prev.filter((_, idx) => idx !== i))}
        />

        <UploadBox
          label="มิเตอร์น้ำประปา"
          icon="water-outline"
          images={waterImages}
          onPick={() => pickImages(setWaterImages, waterImages)}
          onRemove={(i) => setWaterImages(prev => prev.filter((_, idx) => idx !== i))}
        />

        {/* ปุ่มล้างทั้งหมด — แสดงเฉพาะตอนมีรูป */}
        {(electricImages.length + waterImages.length) > 0 && (
          <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
            <Text style={styles.clearAllBtnText}>ล้างรูปทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isProcessing ? (
          <View style={[styles.nextBtn, { opacity: 0.75 }]}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.nextBtnText}>
                  {`AI กำลังอ่าน ${progressDone}/${progressTotal} รูป...`}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0}%` as any }]} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.footerBtns}>
            <TouchableOpacity style={styles.manualBtn} onPress={handleManual} activeOpacity={0.85}>
              <Ionicons name="create-outline" size={18} color="#7C5CFC" />
              <Text style={styles.manualBtnText}>กรอกมิเตอร์</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.aiBtn, (electricImages.length + waterImages.length) === 0 && styles.aiBtnDisabled]}
              onPress={handleAiRead}
              activeOpacity={0.85}
              disabled={(electricImages.length + waterImages.length) === 0}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>อ่านมิเตอร์</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#7C5CFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E' },
  headerSub: { fontSize: 12, color: '#7C5CFC', marginTop: 1 },

  body: {
    padding: 16,
    paddingBottom: 32,
  },

  monthPicker: {
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
    minWidth: 140,
    textAlign: 'center',
  },

  aiBadge: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: 13, fontWeight: '700', color: '#1F1D2E', marginBottom: 3 },
  aiDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  uploadSection: { marginBottom: 20 },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#1F1D2E' },

  uploadBox: {
    borderWidth: 2,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#FAFAFF',
    gap: 8,
  },
  uploadBoxHint: { fontSize: 12, color: '#9CA3AF' },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  pickBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  addMoreBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFF',
  },

  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  nextBtn: {
    backgroundColor: '#7C5CFC',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  progressBar: {
    width: '80%', height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 999,
  },
  progressFill: {
    height: 4, backgroundColor: '#fff', borderRadius: 999,
  },
  clearAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', marginTop: 4,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  clearAllBtnText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  footerBtns: { flexDirection: 'row', gap: 10 },
  manualBtn: {
    flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 14, borderWidth: 1.5, borderColor: '#7C5CFC', backgroundColor: '#fff',
  },
  manualBtnText: { color: '#7C5CFC', fontWeight: '700', fontSize: 15 },
  aiBtn: {
    flex: 1, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 14, backgroundColor: '#7C5CFC',
  },
  aiBtnDisabled: { backgroundColor: '#C4B5FD' },
})
