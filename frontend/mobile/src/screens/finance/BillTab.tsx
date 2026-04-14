import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import { financeApi, type BillCard } from '../../api/finance/financeApi'
import { BillStatusBadge } from './StatusBadges'

function formatAmount(n: number) {
  return n.toLocaleString('th-TH')
}

function itemIcon(title: string): any {
  if (title.includes('ไฟ')) return { name: 'flash', color: '#FBBF24' }
  if (title.includes('น้ำ')) return { name: 'water', color: '#378ADD' }
  return { name: 'grid', color: '#8B8A9B' }
}

// ─── Bill Card ────────────────────────────────────────────────

function BillCardItem({ bill, onPay }: { bill: BillCard; onPay: (bill: BillCard) => void }) {
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
          <TouchableOpacity style={s.btnFill} onPress={() => onPay(bill)}>
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

  const handlePay = (bill: BillCard) => {
    router.push({
      pathname: '/(app)/(tenant)/bill-payment/[id]',
      params: {
        id: bill.billId,
        propertyName: bill.propertyName,
        billingPeriod: bill.billingPeriod,
        tenantName: `${bill.firstName} ${bill.lastName}`,
        roomNumber: bill.roomNumber,
        total: String(bill.total),
      },
    } as any)
  }

  if (loading) return <ActivityIndicator color="#7C5CFC" style={{ marginTop: 60 }} />

  return (
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
        bills.map(bill => <BillCardItem key={bill.billId} bill={bill} onPay={handlePay} />)
      )}
    </ScrollView>
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
    height: 40, borderRadius: 999, backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
})
