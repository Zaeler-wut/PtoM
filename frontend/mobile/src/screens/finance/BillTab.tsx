import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_BILLS, formatAmount, formatMonth, type MockBill } from './mockData'

function BillCard({ bill }: { bill: MockBill }) {
  const isPaid = bill.status === 'PAID'

  if (isPaid) {
    return (
      <View style={s.card}>
        <View style={s.greenHeader}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
              <Text style={s.greenProp}>{bill.propertyName}</Text>
            </View>
            <View style={s.greenBadge}>
              <Ionicons name="checkmark-circle-outline" size={10} color="#27500A" />
              <Text style={s.greenBadgeText}>ชำระแล้ว</Text>
            </View>
          </View>
          <Text style={s.greenMonth}>{formatMonth(bill.month, bill.year)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={[s.greenSub, { fontWeight: '700' }]}>{bill.tenantName}</Text>
            <Text style={s.greenSub}>·</Text>
            <Ionicons name="home-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={[s.greenSub, { fontWeight: '700' }]}>ห้อง {bill.roomNumber}</Text>
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
          {bill.items.map(item => (
            <View key={item.id} style={s.row}>
              <View style={s.rowLabelWrap}>
                <Ionicons
                  name={item.title.includes('ไฟ') ? 'flash' : item.title.includes('น้ำ') ? 'water' : 'grid'}
                  size={14}
                  color={item.title.includes('ไฟ') ? '#FBBF24' : item.title.includes('น้ำ') ? '#378ADD' : '#8B8A9B'}
                />
                <Text style={s.rowLabel}>{item.title}</Text>
              </View>
              <Text style={s.rowVal}>{formatAmount(item.amount)} ฿</Text>
            </View>
          ))}
        </View>

        <View style={s.totalBlock}>
          <Text style={s.totalLabel}>รวมทั้งหมด</Text>
          <Text style={s.totalVal}>{formatAmount(bill.total)} ฿</Text>
        </View>

        <View style={s.paidInfoRow}>
          <Ionicons name="checkmark-circle" size={13} color="#3B6D11" />
          <Text style={s.paidInfoText}>ชำระเมื่อ {bill.dueDate} 07:00 น.</Text>
        </View>

        <View style={s.cardFooter}>
          <TouchableOpacity style={[s.btnOutline, { flex: 1 }]}>
            <Ionicons name="download-outline" size={14} color="#2C2C2A" />
            <Text style={s.btnOutlineText}>ดาวน์โหลด</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={s.card}>
      <View style={s.orangeHeader}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.orangeProp}>{bill.propertyName}</Text>
          </View>
          <View style={s.orangeBadge}>
            <Ionicons name="time-outline" size={10} color="#854F0B" />
            <Text style={s.orangeBadgeText}>รอชำระ</Text>
          </View>
        </View>
        <Text style={s.orangeMonth}>{formatMonth(bill.month, bill.year)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={[s.orangeSub, { fontWeight: '700' }]}>{bill.tenantName}</Text>
          <Ionicons name="home-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={[s.orangeSub, { fontWeight: '700' }]}>ห้อง {bill.roomNumber}</Text>
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
        {bill.items.map(item => (
          <View key={item.id} style={s.row}>
            <View style={s.rowLabelWrap}>
              <Ionicons
                name={item.title.includes('ไฟ') ? 'flash' : item.title.includes('น้ำ') ? 'water' : 'grid'}
                size={14}
                color={item.title.includes('ไฟ') ? '#FBBF24' : item.title.includes('น้ำ') ? '#378ADD' : '#8B8A9B'}
              />
              <Text style={s.rowLabel}>{item.title}</Text>
            </View>
            <Text style={s.rowVal}>{formatAmount(item.amount)} ฿</Text>
          </View>
        ))}
      </View>

      <View style={s.totalBlock}>
        <Text style={s.totalLabel}>รวมทั้งหมด</Text>
        <Text style={s.totalVal}>{formatAmount(bill.total)} ฿</Text>
      </View>

      <View style={s.dueRow}>
        <Ionicons name="alert-circle-outline" size={13} color="#A32D2D" />
        <Text style={s.dueText}>ครบกำหนด {bill.dueDate}</Text>
      </View>

      <View style={s.cardFooter}>
        <TouchableOpacity style={s.btnOutline}>
          <Ionicons name="download-outline" size={14} color="#2C2C2A" />
          <Text style={s.btnOutlineText}>ดาวน์โหลด</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnFill}>
          <Ionicons name="card-outline" size={14} color="#fff" />
          <Text style={s.btnFillText}>ชำระเงิน</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function BillTab() {
  const pendingTotal = MOCK_BILLS
    .filter(b => b.status !== 'PAID')
    .reduce((sum, b) => sum + b.total, 0)

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {pendingTotal > 0 && (
        <TouchableOpacity style={s.summaryCard} activeOpacity={0.85}>
          <View>
            <Text style={s.summaryLabel}>ยอดค้างชำระ</Text>
            <Text style={s.summaryAmount}>{formatAmount(pendingTotal)} ฿</Text>
          </View>
          <View style={s.summaryBtn}>
            <Text style={s.summaryBtnText}>ชำระเงิน →</Text>
          </View>
        </TouchableOpacity>
      )}
      {MOCK_BILLS.map(bill => <BillCard key={bill.id} bill={bill} />)}
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
  summaryBtn: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  summaryBtnText: { fontSize: 12, fontWeight: '600', color: '#FF8C00' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },

  // Orange header (pending)
  orangeHeader: { backgroundColor: '#F4B400', padding: 14, gap: 0 },
  orangeProp: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  orangeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF8E6', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: '#FBBF24',
  },
  orangeBadgeText: { fontSize: 10, color: '#854F0B', fontWeight: '600' },
  orangeMonth: { fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 2, marginBottom: 8 },
  orangeSub: { fontSize: 11, color: '#fff', fontWeight: '600' },

  // Green header (paid)
  greenHeader: { backgroundColor: '#00C853', padding: 14, gap: 0 },
  greenProp: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  greenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EAF3DE', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: '#97C459',
  },
  greenBadgeText: { fontSize: 10, color: '#27500A', fontWeight: '600' },
  greenMonth: { fontSize: 17, fontWeight: '700', color: '#fff', marginTop: 2, marginBottom: 8 },
  greenSub: { fontSize: 11, color: '#fff', fontWeight: '600' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },

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

  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8 },
  dueText: { fontSize: 12, color: '#A32D2D' },

  paidInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8 },
  paidInfoText: { fontSize: 12, color: '#3B6D11' },

  cardFooter: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  btnOutline: {
    flex: 1, height: 40, borderRadius: 999,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnOutlineText: { fontSize: 13, fontWeight: '500', color: '#2C2C2A' },
  btnFill: {
    flex: 1, height: 40, borderRadius: 999,
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
})