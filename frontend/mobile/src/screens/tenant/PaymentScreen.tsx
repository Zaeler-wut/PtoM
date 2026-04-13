import {
  View, Text, StyleSheet, ScrollView as RNScrollView, TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useCallback, useRef, useEffect } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { mobileBookingApi, type BookingInfo } from '../../api/booking/mobileBookingApi'

export default function PaymentScreen() {
  const { id, propertyId, moveInDate } = useLocalSearchParams<{
    id: string
    propertyId: string
    moveInDate: string
  }>()

  const [slipImage, setSlipImage] = useState<string | null>(null)
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const scrollRef = useRef<RNScrollView>(null)

  useEffect(() => {
    if (!id || !propertyId) return
    mobileBookingApi.getBookingInfo(propertyId as string, id as string)
      .then(setBookingInfo)
      .catch(console.error)
      .finally(() => setLoadingInfo(false))
  }, [id, propertyId])

  // ล้างรูปทุกครั้งที่เข้าหน้านี้
  useFocusEffect(
    useCallback(() => {
      setSlipImage(null)
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }, [])
  )

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('ขออนุญาต', 'ต้องการสิทธิ์เข้าถึงรูปภาพ')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    })
    if (!result.canceled) {
      setSlipImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!slipImage) {
      Alert.alert('แจ้งเตือน', 'กรุณาอัปโหลดสลิปการโอนเงินก่อน')
      return
    }
    if (!id || !propertyId || !moveInDate) return
    setSubmitting(true)
    try {
      const slipUrl = await mobileBookingApi.uploadSlip(slipImage)
      const result = await mobileBookingApi.createBooking(
        propertyId as string,
        id as string,
        { moveInDate: moveInDate as string, slipUrl }
      )
      router.push({
        pathname: '/(app)/(tenant)/booking-success/[id]',
        params: {
          id: result.bookingId,
          propertyId,
          moveInDate,
          propertyName: bookingInfo?.propertyName ?? result.propertyName,
          roomTypeName: bookingInfo?.roomTypeName ?? result.roomTypeName,
          rentPerMonth: String((bookingInfo?.roomPrice ?? result.roomPrice) + (bookingInfo?.furniturePrice ?? 0)),
          bookingFee: String(result.bookingFee),
          paidAmount: String(result.paidAmount),
          tenantName: `${result.firstName} ${result.lastName}`,
        }
      } as any)
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.error ?? 'ไม่สามารถจองได้ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/(app)/(tenant)/booking-summary/[id]',
            params: { id, propertyId, moveInDate }
          } as any)}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>จองห้องพัก</Text>
      </View>

      {loadingInfo && (
        <ActivityIndicator color="#7C5CFC" style={{ marginTop: 80 }} />
      )}

      <RNScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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
                <Text style={s.roomPriceVal}>{((bookingInfo?.roomPrice ?? 0) + (bookingInfo?.furniturePrice ?? 0)).toLocaleString('th-TH')} ฿</Text>
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
              <Text style={s.sectionTitle}>ชำระเงินค่าจองห้อง</Text>
            </View>

            <View style={s.sectionBody}>
              <Text style={s.qrLabel}>สแกน QR Code เพื่อชำระเงิน</Text>
              <View style={s.qrWrap}>
                {bookingInfo?.payment?.paymentQrUrl ? (
                  <Image source={{ uri: bookingInfo?.payment?.paymentQrUrl }} style={s.qrImage} resizeMode="contain" />
                ) : (
                  <View style={s.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={80} color="#7C5CFC" />
                  </View>
                )}
              </View>

              <Text style={s.amountLabel}>จำนวนเงิน</Text>
              <Text style={s.amountVal}>{bookingInfo?.bookingFee.toLocaleString('th-TH')} ฿</Text>

              <View style={s.bankCard}>
                <Text style={s.bankTitle}>ธนาคาร</Text>
                <Text style={s.bankName}>{bookingInfo?.payment?.bankName}</Text>
                <Text style={s.bankDetail}>เลขที่บัญชี: {bookingInfo?.payment?.bankAccount}</Text>
                <Text style={s.bankDetail}>ชื่อบัญชี: {bookingInfo?.payment?.bankHolder}</Text>
              </View>

              <TouchableOpacity style={s.saveQrBtn} activeOpacity={0.8}>
                <Ionicons name="download-outline" size={15} color="#7C5CFC" />
                <Text style={s.saveQrText}>บันทึก QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <View style={[s.sectionHeader, { backgroundColor: '#00C853' }]}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>อัปโหลดหลักฐานการโอนเงิน</Text>
            </View>

            <View style={s.sectionBody}>
              {slipImage ? (
                <View style={s.slipPreviewWrap}>
                  <Image source={{ uri: slipImage }} style={s.slipPreview} resizeMode="cover" />
                  <TouchableOpacity style={s.changeSlipBtn} onPress={handlePickImage}>
                    <Text style={s.changeSlipText}>เปลี่ยนรูป</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.uploadBox} onPress={handlePickImage} activeOpacity={0.8}>
                  <Ionicons name="cloud-upload-outline" size={36} color="#9CA3AF" />
                  <Text style={s.uploadTitle}>อัปโหลดสลิปการโอนเงิน</Text>
                  <Text style={s.uploadSub}>JPG, PNG - สลิปจากแอปธนาคาร</Text>
                  <TouchableOpacity style={s.selectBtn} onPress={handlePickImage}>
                    <Ionicons name="image-outline" size={14} color="#fff" />
                    <Text style={s.selectBtnText}>เลือกรูปภาพ</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.backFooterBtn}
              onPress={() => router.push({
                pathname: '/(app)/(tenant)/booking-summary/[id]',
                params: { id, propertyId, moveInDate }
              } as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color="#7C5CFC" />
              <Text style={s.backFooterText}>ย้อนกลับ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={s.submitBtnText}>ชำระเงินแล้ว</Text>
                  </>
              }
            </TouchableOpacity>
          </View>

        </View>
      </RNScrollView>
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
  sectionBody: { padding: 16, alignItems: 'center' },

  qrLabel: { fontSize: 13, color: '#6B7280', marginBottom: 16, alignSelf: 'center' },
  qrWrap: {
    width: 200, height: 200, borderRadius: 16,
    backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  qrImage: { width: '100%', height: '100%' },
  qrPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  amountLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  amountVal: { fontSize: 28, fontWeight: '700', color: '#7C5CFC', marginBottom: 16 },

  bankCard: {
    width: '100%', backgroundColor: '#F5F3FF', borderRadius: 12,
    padding: 14, marginBottom: 12,
  },
  bankTitle: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  bankName: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', marginBottom: 4 },
  bankDetail: { fontSize: 13, color: '#6B7280' },

  saveQrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#7C5CFC', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'stretch',
    justifyContent: 'center',
  },
  saveQrText: { fontSize: 13, color: '#7C5CFC', fontWeight: '500' },

  uploadBox: {
    width: '100%', borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed',
    padding: 24, alignItems: 'center', gap: 8,
    backgroundColor: '#FAFAFA',
  },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#1F1D2E' },
  uploadSub: { fontSize: 12, color: '#9CA3AF' },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#00C853', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 4,
  },
  selectBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  slipPreviewWrap: { width: '100%', alignItems: 'center', gap: 12 },
  slipPreview: { width: '100%', height: 350, borderRadius: 12 },
  changeSlipBtn: {
    borderWidth: 1, borderColor: '#7C5CFC', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  changeSlipText: { fontSize: 13, color: '#7C5CFC', fontWeight: '500' },

  btnRow: { flexDirection: 'row', gap: 12 },
  backFooterBtn: {
    flex: 1, height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  backFooterText: { fontSize: 15, fontWeight: '600', color: '#7C5CFC' },
  submitBtn: {
    flex: 1, height: 52, borderRadius: 14,
    backgroundColor: '#00C853',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})