import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image, Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { financeApi, type BillCard, type BillPaymentInfo } from '../../api/finance/financeApi'
import { BillStatusBadge } from './StatusBadges'

function formatAmount(n: number) {
  return n.toLocaleString('th-TH')
}

function itemIcon(title: string): any {
  if (title.includes('ไฟ')) return { name: 'flash', color: '#FBBF24' }
  if (title.includes('น้ำ')) return { name: 'water', color: '#378ADD' }
  return { name: 'grid', color: '#8B8A9B' }
}

// ─── Payment Modal ────────────────────────────────────────────

function PaymentModal({
  visible, info, onClose, onSubmit, submitting,
}: {
  visible: boolean
  info: BillPaymentInfo | null
  onClose: () => void
  onSubmit: (slip: string) => void
  submitting: boolean
}) {
  const [slip, setSlip] = useState<string | null>(null)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('ขออนุญาต', 'ต้องการสิทธิ์เข้าถึงรูปภาพ'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: false, quality: 0.8,
    })
    if (!result.canceled) setSlip(result.assets[0].uri)
  }

  if (!info) return null
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={pm.overlay}>
        <View style={pm.sheet}>
          <View style={pm.sheetHeader}>
            <Text style={pm.sheetTitle}>ชำระบิลค่าเช่า</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#888" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={pm.period}>{info.billingPeriod}</Text>
            <Text style={pm.prop}>{info.propertyName}</Text>

            {info.paymentQrUrl && (
              <View style={pm.qrWrap}>
                <Image source={{ uri: info.paymentQrUrl }} style={pm.qrImg} resizeMode="contain" />
              </View>
            )}

            <View style={pm.bankCard}>
              <Text style={pm.bankTitle}>{info.bankName}</Text>
              <Text style={pm.bankDetail}>เลขบัญชี: {info.bankAccount}</Text>
              <Text style={pm.bankDetail}>ชื่อบัญชี: {info.bankHolder}</Text>
            </View>

            <View style={pm.totalRow}>
              <Text style={pm.totalLabel}>ยอดชำระ</Text>
              <Text style={pm.totalVal}>{formatAmount(info.total)} ฿</Text>
            </View>

            {slip ? (
              <View style={pm.slipWrap}>
                <Image source={{ uri: slip }} style={pm.slipImg} resizeMode="cover" />
                <TouchableOpacity style={pm.changeBtn} onPress={pickImage}>
                  <Text style={pm.changeBtnText}>เปลี่ยนรูป</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={pm.uploadBox} onPress={pickImage} activeOpacity={0.8}>
                <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                <Text style={pm.uploadTitle}>อัปโหลดสลิปการโอนเงิน</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[pm.submitBtn, (!slip || submitting) && { opacity: 0.5 }]}
              onPress={() => slip && onSubmit(slip)}
              disabled={!slip || submitting}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={pm.submitBtnText}>ยืนยันการชำระเงิน</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ─── Bill Card ────────────────────────────────────────────────

function BillCard({ bill, onPay }: { bill: BillCard; onPay: (id: string) => void }) {
  const isPaid = bill.status === 'PAID'
  const isVerifying = bill.status === 'VERIFYING'
  const headerBg = isPaid ? '#00C853' : isVerifying ? '#3B82F6' : '#F4B400'

  const allItems: { title: string; amount: number }[] = []
  if (bill.electricCharge > 0) allItems.push({ title: 'ค่าไฟฟ้า', amount: bill.electricCharge })
  if (bill.waterCharge > 0) allItems.push({ title: 'ค่าน้ำประปา', amount: bill.waterCharge })
  bill.extraFees.forEach(f => allItems.push(f))

  return (
    <View style={s.card}>
      <View style={[s.cardHeader, { backgroundColor: headerBg }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.headerProp}>{bill.propertyName}</Text>
          </View>
          <BillStatusBadge status={bill.status} />
        </View>
        <Text style={s.headerPeriod}>{bill.billingPeriod}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="home-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={s.headerSub}>ห้อง {bill.roomNumber}</Text>
        </View>
      </View>

      <View style={s.cardBody}>
        <View style={s.row}>
          <View style={s.rowLabelWrap}>
            <Ionicons name="cash-outline" size={14} color="#F5A623" />
            <Text style={s.rowLabel}>ค่าเช่า</Text>
          </View>
          <Text style={s.rowVal}>{formatAmount(bill.roomRent)} ฿</Text>
        </View>
        {allItems.map((item, i) => {
          const ico = itemIcon(item.title)
          return (
            <View key={i} style={s.row}>
              <View style={s.rowLabelWrap}>
                <Ionicons name={ico.name} size={14} color={ico.color} />
                <Text style={s.rowLabel}>{item.title}</Text>
              </View>
              <Text style={s.rowVal}>{formatAmount(item.amount)} ฿</Text>
            </View>
          )
        })}
      </View>

      <View style={s.totalBlock}>
        <Text style={s.totalLabel}>รวมทั้งหมด</Text>
        <Text style={s.totalVal}>{formatAmount(bill.total)} ฿</Text>
      </View>

      {isPaid && (
        <View style={s.infoRow}>
          <Ionicons name="checkmark-circle" size={13} color="#3B6D11" />
          <Text style={[s.infoText, { color: '#3B6D11' }]}>ชำระเรียบร้อยแล้ว</Text>
        </View>
      )}
      {isVerifying && (
        <View style={s.infoRow}>
          <Ionicons name="search-outline" size={13} color="#185FA5" />
          <Text style={[s.infoText, { color: '#185FA5' }]}>กำลังตรวจสอบหลักฐานการชำระ</Text>
        </View>
      )}
      {!isPaid && !isVerifying && bill.dueDate && (
        <View style={s.infoRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#A32D2D" />
          <Text style={[s.infoText, { color: '#A32D2D' }]}>ครบกำหนด {bill.dueDate}</Text>
        </View>
      )}

      <View style={s.cardFooter}>
        {!isPaid && !isVerifying && (
          <TouchableOpacity style={s.btnFill} onPress={() => onPay(bill.billId)}>
            <Ionicons name="card-outline" size={14} color="#fff" />
            <Text style={s.btnFillText}>ชำระเงิน</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// ─── BillTab ──────────────────────────────────────────────────

export default function BillTab() {
  const [bills, setBills] = useState<BillCard[]>([])
  const [totalUnpaid, setTotalUnpaid] = useState(0)
  const [loading, setLoading] = useState(true)
  const [payInfo, setPayInfo] = useState<BillPaymentInfo | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const data = await financeApi.getBills()
      setBills(data.bills)
      setTotalUnpaid(data.totalUnpaid)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handlePay = async (billId: string) => {
    try {
      const info = await financeApi.getBillPaymentInfo(billId)
      setPayInfo(info)
      setModalVisible(true)
    } catch (e: any) {
      Alert.alert('ข้อผิดพลาด', e.message)
    }
  }

  const handleSubmit = async (slipUri: string) => {
    if (!payInfo) return
    setSubmitting(true)
    try {
      const slipUrl = await financeApi.uploadSlip(slipUri)
      await financeApi.submitPayment(payInfo.billId, slipUrl, payInfo.total)
      setModalVisible(false)
      setPayInfo(null)
      Alert.alert('สำเร็จ', 'ส่งหลักฐานการชำระเงินแล้ว รอการยืนยัน')
      load()
    } catch (e: any) {
      Alert.alert('ข้อผิดพลาด', e.response?.data?.error ?? e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <ActivityIndicator color="#7C5CFC" style={{ marginTop: 60 }} />

  return (
    <>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {totalUnpaid > 0 && (
          <View style={s.summaryCard}>
            <View>
              <Text style={s.summaryLabel}>ยอดค้างชำระ</Text>
              <Text style={s.summaryAmount}>{formatAmount(totalUnpaid)} ฿</Text>
            </View>
            <View style={s.summaryBadge}>
              <Ionicons name="alert-circle" size={14} color="#FF8C00" />
              <Text style={s.summaryBadgeText}>รอชำระ</Text>
            </View>
          </View>
        )}

        {bills.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color="#C4B5FD" />
            <Text style={s.emptyText}>ยังไม่มีบิล</Text>
          </View>
        ) : (
          bills.map(bill => <BillCard key={bill.billId} bill={bill} onPay={handlePay} />)
        )}
      </ScrollView>

      <PaymentModal
        visible={modalVisible}
        info={payInfo}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  )
}

const s = StyleSheet.create({
  content: { padding: 14, gap: 12 },

  summaryCard: {
    backgroundColor: '#FF8C00', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  summaryAmount: { fontSize: 26, fontWeight: '700', color: '#fff' },
  summaryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  summaryBadgeText: { fontSize: 12, fontWeight: '600', color: '#FF8C00' },

  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  cardHeader: { padding: 14, gap: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerProp: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  headerPeriod: { fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 2, marginBottom: 8 },
  headerSub: { fontSize: 11, color: '#fff', fontWeight: '600' },

  cardBody: { padding: 14, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  rowLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { fontSize: 13, color: '#8B8A9B' },
  rowVal: { fontSize: 13, color: '#2C2C2A' },

  totalBlock: {
    marginHorizontal: 14, marginBottom: 4,
    backgroundColor: '#7C5CFC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  totalVal: { fontSize: 20, fontWeight: '700', color: '#fff' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8 },
  infoText: { fontSize: 12 },

  cardFooter: { paddingHorizontal: 14, paddingBottom: 14 },
  btnFill: {
    height: 40, borderRadius: 999,
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
})

// Payment Modal styles
const pm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '90%',
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1F1D2E' },
  period: { fontSize: 15, fontWeight: '600', color: '#7C5CFC', marginBottom: 2 },
  prop: { fontSize: 12, color: '#9CA3AF', marginBottom: 16 },
  qrWrap: {
    alignSelf: 'center', width: 180, height: 180, borderRadius: 12,
    backgroundColor: '#F5F3FF', overflow: 'hidden', marginBottom: 14,
  },
  qrImg: { width: '100%', height: '100%' },
  bankCard: {
    backgroundColor: '#F5F3FF', borderRadius: 12,
    padding: 14, marginBottom: 14,
  },
  bankTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E', marginBottom: 4 },
  bankDetail: { fontSize: 13, color: '#6B7280' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#7C5CFC', borderRadius: 12, padding: 14, marginBottom: 16,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  totalVal: { fontSize: 22, fontWeight: '700', color: '#fff' },
  uploadBox: {
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed',
    borderRadius: 14, padding: 24, alignItems: 'center', gap: 8,
    backgroundColor: '#FAFAFA', marginBottom: 16,
  },
  uploadTitle: { fontSize: 14, fontWeight: '600', color: '#1F1D2E' },
  slipWrap: { alignItems: 'center', gap: 10, marginBottom: 16 },
  slipImg: { width: '100%', height: 280, borderRadius: 12 },
  changeBtn: {
    borderWidth: 1, borderColor: '#7C5CFC', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  changeBtnText: { fontSize: 13, color: '#7C5CFC', fontWeight: '500' },
  submitBtn: {
    backgroundColor: '#00C853', borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})
