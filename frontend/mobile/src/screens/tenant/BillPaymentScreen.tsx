import {
  View, Text, StyleSheet, ScrollView as RNScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useCallback, useRef } from 'react'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { financeApi, type BillPaymentInfo } from '../../api/finance/financeApi'

export default function BillPaymentScreen() {
  const { id, propertyName, billingPeriod, tenantName, roomNumber, total } =
    useLocalSearchParams<{
      id: string
      propertyName: string
      billingPeriod: string
      tenantName: string
      roomNumber: string
      total: string
    }>()

  const [info, setInfo] = useState<BillPaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [slipImage, setSlipImage] = useState<string | null>(null)
  const [slipName, setSlipName] = useState<string>('')
  const [slipSize, setSlipSize] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const scrollRef = useRef<RNScrollView>(null)

  useEffect(() => {
    if (!id) return
    financeApi.getBillPaymentInfo(id as string)
      .then(setInfo)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

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
      mediaTypes: ['images'], allowsEditing: false, quality: 0.8,
    })
    if (!result.canceled) {
      const asset = result.assets[0]
      setSlipImage(asset.uri)
      setSlipName(asset.fileName ?? asset.uri.split('/').pop() ?? 'slip.jpg')
      const kb = asset.fileSize ? Math.round(asset.fileSize / 1024) : null
      setSlipSize(kb ? `${kb} KB` : '')
    }
  }

  const handleSubmit = async () => {
    if (!slipImage) {
      Alert.alert('แจ้งเตือน', 'กรุณาอัปโหลดสลิปการโอนเงินก่อน')
      return
    }
    if (!info) return
    setSubmitting(true)
    try {
      const slipUrl = await financeApi.uploadSlip(slipImage)
      await financeApi.submitPayment(info.billId, slipUrl, info.total)
      router.replace({
        pathname: '/(app)/(tenant)/bill-payment-success',
        params: {
          propertyName: propertyName ?? info.propertyName,
          billingPeriod: billingPeriod ?? info.billingPeriod,
          tenantName: tenantName ?? '',
          roomNumber: roomNumber ?? '',
          total: String(info.total),
        },
      } as any)
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.error ?? 'ไม่สามารถชำระเงินได้ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  const totalNum = Number(total) || info?.total || 0

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ชำระค่าเช่า</Text>
      </View>

      {loading && <ActivityIndicator color="#7C5CFC" style={{ marginTop: 80 }} />}

      <RNScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.body}>

          {/* Top card */}
          <View style={s.topCard}>
            <View style={s.topCardRow}>
              <Ionicons name="location-sharp" size={12} color="#7C5CFC" />
              <Text style={s.topPropName}>{propertyName ?? info?.propertyName}</Text>
            </View>
            <Text style={s.topPeriod}>{billingPeriod ?? info?.billingPeriod}</Text>
            {(tenantName || roomNumber) ? (
              <View style={s.topCardRow}>
                <Ionicons name="person-outline" size={12} color="#7C5CFC" />
                <Text style={s.topSub}>{tenantName}  •  ห้อง {roomNumber}</Text>
              </View>
            ) : null}
            <View style={s.topAmountRow}>
              <Text style={s.topAmountLabel}>ยอดชำระ</Text>
              <Text style={s.topAmount}>{totalNum.toLocaleString('th-TH')} ฿</Text>
            </View>
          </View>

          {/* QR + bank */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>สแกน QR Code เพื่อสั่งจ่าย</Text>
            </View>
            <View style={s.sectionBody}>
              <View style={s.qrWrap}>
                {info?.paymentQrUrl ? (
                  <Image source={{ uri: info.paymentQrUrl }} style={s.qrImage} resizeMode="contain" />
                ) : (
                  <View style={s.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={80} color="#7C5CFC" />
                  </View>
                )}
              </View>

              <Text style={s.amountLabel}>จำนวนเงิน</Text>
              <Text style={s.amountVal}>{totalNum.toLocaleString('th-TH')} ฿</Text>

              {/* Items */}
              {info && info.items.length > 0 && (
                <View style={s.itemsBox}>
                  {info.items.map((item, i) => (
                    <View key={i} style={s.itemRow}>
                      <Text style={s.itemTitle}>{item.title}</Text>
                      <Text style={s.itemAmount}>{item.amount.toLocaleString('th-TH')} ฿</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Bank */}
              {info && (
                <View style={s.bankCard}>
                  <Text style={s.bankName}>{info.bankName}</Text>
                  <Text style={s.bankDetail}>เลขบัญชี: {info.bankAccount}</Text>
                  <Text style={s.bankDetail}>ชื่อบัญชี: {info.bankHolder}</Text>
                </View>
              )}

              <View style={s.qrHintBox}>
                <Ionicons name="camera-outline" size={14} color="#7C5CFC" />
                <Text style={s.qrHintText}>แคปภาพหน้าจอ QR Code แล้วนำไปสแกนจ่ายเงินผ่านแอปธนาคาร</Text>
              </View>
            </View>
          </View>

          {/* Upload slip */}
          <View style={s.section}>
            <View style={[s.sectionHeader, { backgroundColor: '#00C853' }]}>
              <View style={s.sectionBar} />
              <Text style={s.sectionTitle}>อัปโหลดหลักฐานการโอนเงิน</Text>
            </View>
            <View style={s.sectionBody}>
              {slipImage ? (
                <View style={s.slipSuccessBox}>
                  <View style={s.slipSuccessRow}>
                    <View style={s.slipSuccessLeft}>
                      <Ionicons name="checkmark-circle" size={20} color="#00C853" />
                      <Text style={s.slipSuccessText}>อัปโหลดสลิปสำเร็จ</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSlipImage(null)}>
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.slipFileName}>{slipName}</Text>
                  {slipSize ? <Text style={s.slipFileSize}>{slipSize}</Text> : null}
                </View>
              ) : (
                <TouchableOpacity style={s.uploadBox} onPress={handlePickImage} activeOpacity={0.8}>
                  <Ionicons name="cloud-upload-outline" size={36} color="#9CA3AF" />
                  <Text style={s.uploadTitle}>อัปโหลดสลิปการโอนเงิน</Text>
                  <Text style={s.uploadSub}>JPG, PNG - สลิปจากแอปธนาคาร</Text>
                  <View style={s.selectBtn}>
                    <Ionicons name="image-outline" size={14} color="#fff" />
                    <Text style={s.selectBtnText}>เลือกรูปภาพ</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.backFooterBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={16} color="#7C5CFC" />
              <Text style={s.backFooterText}>ย้อนกลับ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.submitBtn, (!slipImage || submitting) && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={!slipImage || submitting}
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
  safe: { flex: 1, backgroundColor: '#7C5CFC' },
  header: {
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { padding: 16, gap: 16 },

  topCard: {
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.2)', gap: 4,
  },
  topCardRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topPropName: { fontSize: 11, color: '#7C5CFC', fontWeight: '500' },
  topPeriod: { fontSize: 16, fontWeight: '700', color: '#7C5CFC', marginVertical: 2 },
  topSub: { fontSize: 11, color: '#7C5CFC' },
  topAmountRow: { marginTop: 8 },
  topAmountLabel: { fontSize: 11, color: '#7C5CFC', marginBottom: 2 },
  topAmount: { fontSize: 26, fontWeight: '700', color: '#7C5CFC' },

  section: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 14,
  },
  sectionBar: { width: 4, height: 20, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sectionBody: { padding: 16, alignItems: 'center' },

  qrWrap: {
    width: 200, height: 200, borderRadius: 16,
    backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  qrImage: { width: '100%', height: '100%' },
  qrPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  amountLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  amountVal: { fontSize: 28, fontWeight: '700', color: '#7C5CFC', marginBottom: 12 },

  itemsBox: {
    width: '100%', backgroundColor: '#F9F8FF', borderRadius: 12,
    padding: 12, marginBottom: 12, gap: 6,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTitle: { fontSize: 13, color: '#6B7280' },
  itemAmount: { fontSize: 13, color: '#1F1D2E', fontWeight: '500' },

  bankCard: {
    width: '100%', backgroundColor: '#F5F3FF', borderRadius: 12,
    padding: 14, marginBottom: 12,
  },
  bankName: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', marginBottom: 4 },
  bankDetail: { fontSize: 13, color: '#6B7280' },

  qrHintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#F5F3FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'stretch',
  },
  qrHintText: { fontSize: 12, color: '#7C5CFC', flex: 1, lineHeight: 18 },

  slipSuccessBox: {
    width: '100%', backgroundColor: '#F0FDF4', borderRadius: 12,
    borderWidth: 1, borderColor: '#86EFAC', padding: 14, gap: 6,
  },
  slipSuccessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slipSuccessLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slipSuccessText: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  slipFileName: { fontSize: 12, color: '#374151', marginLeft: 28 },
  slipFileSize: { fontSize: 11, color: '#9CA3AF', marginLeft: 28 },

  uploadBox: {
    width: '100%', borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed',
    padding: 24, alignItems: 'center', gap: 8, backgroundColor: '#FAFAFA',
  },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#1F1D2E' },
  uploadSub: { fontSize: 12, color: '#9CA3AF' },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#00C853', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 4,
  },
  selectBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  btnRow: { flexDirection: 'row', gap: 12 },
  backFooterBtn: {
    flex: 1, height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  backFooterText: { fontSize: 15, fontWeight: '600', color: '#7C5CFC' },
  submitBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: '#00C853',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
