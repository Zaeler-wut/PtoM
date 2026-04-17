import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, Image,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useRef } from 'react'
import { router } from 'expo-router'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'
import { financeApi, type BillCard } from '../../api/finance/financeApi'
import { BillStatusBadge } from './StatusBadges'

function formatAmount(n: number) {
  return n.toLocaleString('th-TH')
}

function itemIcon(title: string): { name: any; color: string } {
  if (title.includes('ไฟ')) return { name: 'flash', color: '#F59E0B' }
  if (title.includes('น้ำ')) return { name: 'water', color: '#3B82F6' }
  if (title.includes('เช่า')) return { name: 'home-outline', color: '#F97316' }
  return { name: 'document-text-outline', color: '#8B8A9B' }
}

// ─── HTML template for PDF ────────────────────────────────────

type BillDetail = Awaited<ReturnType<typeof import('../../api/finance/financeApi').financeApi['getBillDetail']>>

function buildBillHtml(d: BillDetail): string {
  const fmt = (n: number) => n.toLocaleString('th-TH')

  // สร้าง sub-text สำหรับมิเตอร์
  function meterSub(title: string): string {
    if (title.includes('ไฟ')) {
      return `<div style="font-size:10px;color:#7C5CFC;margin-top:2px">${d.meter.electricPrev} → ${d.meter.electricCurrent} = ใช้ไป ${d.meter.electricCurrent - d.meter.electricPrev} หน่วย</div>`
    }
    if (title.includes('น้ำ')) {
      return `<div style="font-size:10px;color:#7C5CFC;margin-top:2px">${d.meter.waterPrev} → ${d.meter.waterCurrent} = ใช้ไป ${d.meter.waterCurrent - d.meter.waterPrev} หน่วย</div>`
    }
    return ''
  }

  // แยก unit+rate จาก title เช่น "ค่าน้ำประปา (10 หน่วย × ฿18)"
  function parseItemCols(item: { title: string; amount: number }, idx: number) {
    const match = item.title.match(/\((\d+)\s*หน่วย\s*×\s*฿([\d.]+)\)/)
    if (match) {
      const units = match[1]
      const rate = parseFloat(match[2])
      const cleanTitle = item.title.replace(/\s*\(.*\)/, '')
      return `<tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>${cleanTitle}${meterSub(item.title)}</td>
        <td style="text-align:center">${units}</td>
        <td style="text-align:right">${rate.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right;font-weight:700">${fmt(item.amount)}.00</td>
      </tr>`
    }
    return `<tr>
      <td style="text-align:center">${idx + 1}</td>
      <td>${item.title}</td>
      <td style="text-align:center">1</td>
      <td style="text-align:right">${fmt(item.amount)}.00</td>
      <td style="text-align:right;font-weight:700">${fmt(item.amount)}.00</td>
    </tr>`
  }

  const rows = d.items.map((item, i) => parseItemCols(item, i)).join('')

  // ไม่ใช้ external URL ใน PDF (ทำให้ WebView ค้าง) — ใช้ placeholder แทน
  const logoHtml = `<div style="width:44px;height:44px;background:#7C5CFC;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-right:12px;color:#fff;font-size:20px;font-weight:700">${d.property.name[0]}</div>`
  const qrHtml = '' // ไม่ใส่ QR ใน PDF เพราะต้องโหลดจากเน็ต

  const noteLines = d.property.billNote
    ? d.property.billNote.split('\n').map((l) => `<div>${l}</div>`).join('')
    : ''

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Helvetica Neue",Arial,sans-serif;padding:28px;color:#1a1a1a;font-size:13px;line-height:1.5}
    .header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
    .header-left{display:flex;align-items:center}
    .prop-name{font-size:17px;font-weight:700;margin-bottom:2px}
    .prop-addr{font-size:11px;color:#666}
    .badge{background:#7C5CFC;color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;font-weight:700}
    .date{font-size:11px;color:#888;margin-top:4px;text-align:right}
    .info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#f8f8f8;border-radius:10px;padding:14px;margin-bottom:18px}
    .info-label{font-size:10px;color:#888;margin-bottom:3px}
    .info-val{font-size:13px;font-weight:700}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    thead tr{background:#1a1a1a}
    th{color:#fff;padding:9px 10px;font-size:12px;font-weight:600}
    td{padding:9px 10px;border-bottom:1px solid #f0f0f0;font-size:12px;vertical-align:top}
    .total-row td{background:#7C5CFC;color:#fff;font-weight:700;font-size:14px;border:none;padding:12px 10px}
    .section{border:1px solid #eee;border-radius:10px;padding:14px;margin-bottom:14px}
    .section-title{font-size:11px;font-weight:700;color:#7C5CFC;margin-bottom:10px}
    .pay-row{display:flex;justify-content:space-between;align-items:center}
    .pay-info{flex:1}
    .pay-line{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
    .pay-line:last-child{border-bottom:none}
    .pay-key{color:#888}
    .pay-val{font-weight:600}
    .note-line{font-size:11px;color:#555;margin-top:4px}
  </style></head><body>

  <div class="header">
    <div class="header-left">
      ${logoHtml}
      <div>
        <div class="prop-name">${d.property.name}</div>
        <div class="prop-addr">${d.property.address}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="badge">ใบแจ้งค่าบริการ</div>
      <div class="date">${d.dateStr}</div>
    </div>
  </div>

  <div class="info-grid">
    <div><div class="info-label">ห้องพัก</div><div class="info-val">ห้อง ${d.roomNumber}</div></div>
    <div><div class="info-label">ประเภทห้อง</div><div class="info-val">${d.roomTypeName}</div></div>
    <div><div class="info-label">ผู้เช่า</div><div class="info-val">${d.tenantName}</div></div>
    <div><div class="info-label">งวดประจำเดือน</div><div class="info-val">${d.billingPeriod}</div></div>
  </div>

  <table>
    <thead><tr>
      <th style="width:36px;text-align:center">ลำดับ</th>
      <th>รายการ</th>
      <th style="width:56px;text-align:center">จำนวน</th>
      <th style="width:88px;text-align:right">ราคา/หน่วย</th>
      <th style="width:96px;text-align:right">รวมเป็นเงิน</th>
    </tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="total-row">
      <td colspan="4" style="text-align:right">รวมสุทธิ</td>
      <td style="text-align:right">${fmt(d.total)}.00</td>
    </tr></tfoot>
  </table>

  ${(d.property.bankName || d.property.bankAccount) ? `
  <div class="section">
    <div class="section-title">● ช่องทางการชำระเงิน</div>
    <div class="pay-row">
      <div class="pay-info">
        <div class="pay-line"><span class="pay-key">ธนาคาร</span><span class="pay-val">${d.property.bankName}</span></div>
        <div class="pay-line"><span class="pay-key">เลขที่บัญชี</span><span class="pay-val">${d.property.bankAccount}</span></div>
        <div class="pay-line"><span class="pay-key">ชื่อบัญชี</span><span class="pay-val">${d.property.bankHolder}</span></div>
      </div>
      ${qrHtml ? `<div style="margin-left:16px">${qrHtml}</div>` : ''}
    </div>
  </div>` : ''}

  ${(noteLines || d.issuerName) ? `
  <div class="section">
    <div class="section-title">● หมายเหตุ</div>
    ${noteLines ? `<div>${noteLines}</div>` : ''}
    ${d.issuerName ? `<div style="text-align:right;font-size:10px;color:#9CA3AF;margin-top:8px">ผู้จัดทำ: ${d.issuerName}</div>` : ''}
  </div>` : ''}

  </body></html>`
}

// ─── Bill Preview Modal ───────────────────────────────────────

type BillDetailData = Awaited<ReturnType<typeof financeApi['getBillDetail']>>

function BillPreviewModal({ bill, onClose, onPay }: {
  bill: BillCard
  onClose: () => void
  onPay: () => void
}) {
  const insets = useSafeAreaInsets()
  const [detail, setDetail] = useState<BillDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pdfsaving, setPdfsaving] = useState(false)
  const captureViewRef = useRef<View>(null)

  useEffect(() => {
    financeApi.getBillDetail(bill.billId)
      .then(setDetail)
      .catch(() => Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบิลได้'))
      .finally(() => setLoading(false))
  }, [bill.billId])

  const handleSaveImage = async () => {
    if (!captureViewRef.current) return
    setSaving(true)
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงคลังรูปภาพ')
        return
      }
      const uri = await captureRef(captureViewRef, { format: 'jpg', quality: 1 })
      await MediaLibrary.saveToLibraryAsync(uri)
      Alert.alert('สำเร็จ', 'บันทึกภาพลงคลังรูปภาพแล้ว')
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกภาพได้')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!detail) return
    setPdfsaving(true)
    try {
      const html = buildBillHtml(detail)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 30000)
      )
      const { uri } = await Promise.race([
        Print.printToFileAsync({ html, base64: false }),
        timeout,
      ])
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `ใบแจ้งหนี้-ห้อง${bill.roomNumber}`,
        UTI: 'com.adobe.pdf',
      })
    } catch (e: any) {
      if (e?.message === 'timeout') {
        Alert.alert('ใช้เวลานานเกินไป', 'ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่')
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้าง PDF ได้')
      }
    } finally {
      setPdfsaving(false)
    }
  }

  const isPaid = bill.status === 'PAID'
  const isVerifying = bill.status === 'VERIFYING'

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={m.safe} edges={['bottom']}>
        {/* Header */}
        <View style={[m.header, { paddingTop: insets.top + 14 }]}>
          <Text style={m.headerTitle}>ใบแจ้งค่าบริการ</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Ionicons name="close" size={24} color="#1F1D2E" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#7C5CFC" size="large" />
          </View>
        ) : detail ? (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
            {/* Capturable bill content */}
            <View ref={captureViewRef} style={m.billSheet} collapsable={false}>
              {/* Property header */}
              <View style={m.propHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={m.propName}>{detail.property.name}</Text>
                  {!!detail.property.address && <Text style={m.propAddr}>{detail.property.address}</Text>}
                </View>
                <View>
                  <View style={m.badge}><Text style={m.badgeText}>ใบแจ้งค่าบริการ</Text></View>
                  <Text style={m.dateStr}>{detail.dateStr}</Text>
                </View>
              </View>

              {/* Info grid */}
              <View style={m.infoGrid}>
                {[
                  { label: 'ห้องพัก', val: `ห้อง ${detail.roomNumber}` },
                  { label: 'ประเภทห้อง', val: detail.roomTypeName },
                  { label: 'ผู้เช่า', val: detail.tenantName },
                  { label: 'งวดประจำเดือน', val: detail.billingPeriod },
                ].map(({ label, val }) => (
                  <View key={label} style={m.infoCell}>
                    <Text style={m.infoLabel}>{label}</Text>
                    <Text style={m.infoVal}>{val}</Text>
                  </View>
                ))}
              </View>

              {/* Table header */}
              <View style={m.tableHead}>
                {['ลำดับ', 'รายการ', 'จำนวน', 'ราคา/หน่วย', 'รวม'].map((h, i) => (
                  <Text key={h} style={[m.th, i === 0 && { width: 32, textAlign: 'center' }, i === 1 && { flex: 1 }, i >= 2 && { width: 64, textAlign: 'right' }]}>{h}</Text>
                ))}
              </View>

              {/* Items */}
              {detail.items.map((item, i) => {
                const match = item.title.match(/\((\d+)\s*หน่วย\s*×\s*฿([\d.]+)\)/)
                const cleanTitle = match ? item.title.replace(/\s*\(.*\)/, '') : item.title
                const units = match ? match[1] : '1'
                const rate = match ? parseFloat(match[2]).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                const meterNote = item.title.includes('ไฟ')
                  ? `${detail.meter.electricPrev} → ${detail.meter.electricCurrent} = ใช้ไป ${detail.meter.electricCurrent - detail.meter.electricPrev} หน่วย`
                  : item.title.includes('น้ำ')
                    ? `${detail.meter.waterPrev} → ${detail.meter.waterCurrent} = ใช้ไป ${detail.meter.waterCurrent - detail.meter.waterPrev} หน่วย`
                    : null
                return (
                  <View key={i} style={m.tableRow}>
                    <Text style={[m.td, { width: 32, textAlign: 'center' }]}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={m.td}>{cleanTitle}</Text>
                      {meterNote && <Text style={m.meterNote}>{meterNote}</Text>}
                    </View>
                    <Text style={[m.td, { width: 64, textAlign: 'right' }]}>{units}</Text>
                    <Text style={[m.td, { width: 64, textAlign: 'right' }]}>{rate}</Text>
                    <Text style={[m.td, { width: 64, textAlign: 'right', fontWeight: '700' }]}>{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</Text>
                  </View>
                )
              })}

              {/* Total */}
              <View style={m.totalRow}>
                <Text style={[m.totalText, { flex: 1, textAlign: 'right', marginRight: 8 }]}>รวมสุทธิ</Text>
                <Text style={[m.totalText, { width: 64, textAlign: 'right' }]}>{detail.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</Text>
              </View>

              {/* Payment info */}
              {(detail.property.bankName || detail.property.bankAccount) && (
                <View style={m.section}>
                  <Text style={m.sectionTitle}>● ช่องทางการชำระเงิน</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      {[
                        ['ธนาคาร', detail.property.bankName],
                        ['เลขที่บัญชี', detail.property.bankAccount],
                        ['ชื่อบัญชี', detail.property.bankHolder],
                      ].map(([k, v]) => (
                        <View key={k} style={m.payRow}>
                          <Text style={m.payKey}>{k}</Text>
                          <Text style={m.payVal}>{v}</Text>
                        </View>
                      ))}
                    </View>
                    {detail.property.paymentQrUrl && (
                      <Image source={{ uri: detail.property.paymentQrUrl }} style={m.qr} />
                    )}
                  </View>
                </View>
              )}

              {/* Notes */}
              {(!!detail.property.billNote || !!detail.issuerName) && (
                <View style={m.section}>
                  <Text style={m.sectionTitle}>● หมายเหตุ</Text>
                  {detail.property.billNote
                    ? detail.property.billNote.split('\n').map((line, i) => (
                        <Text key={i} style={m.noteText}>{line}</Text>
                      ))
                    : null}
                  {!!detail.issuerName && (
                    <Text style={[m.noteText, { textAlign: 'right', color: '#9CA3AF', marginTop: 6 }]}>ผู้จัดทำ: {detail.issuerName}</Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        ) : null}

        {/* Action buttons */}
        <View style={m.footer}>
          <TouchableOpacity style={[m.actionBtn, m.actionBtnOutline, saving && { opacity: 0.6 }]} onPress={handleSaveImage} disabled={saving || loading}>
            <Ionicons name="image-outline" size={16} color="#7C5CFC" />
            <Text style={m.actionBtnOutlineText}>{saving ? 'กำลังบันทึก...' : 'บันทึกเป็นภาพ'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[m.actionBtn, m.actionBtnFill, pdfsaving && { opacity: 0.6 }]} onPress={handleDownloadPdf} disabled={pdfsaving || loading}>
            <Ionicons name="document-text-outline" size={16} color="#fff" />
            <Text style={m.actionBtnFillText}>{pdfsaving ? 'กำลังสร้าง...' : 'โหลด PDF'}</Text>
          </TouchableOpacity>
          {!isPaid && !isVerifying && (
            <TouchableOpacity style={[m.actionBtn, { backgroundColor: '#22C55E', borderRadius: 10, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={onPay}>
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={[m.actionBtnFillText]}>ชำระเงิน</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

// ─── Bill Card ────────────────────────────────────────────────

function BillCardItem({ bill, onPay }: { bill: BillCard; onPay: (bill: BillCard) => void }) {
  const isPaid = bill.status === 'PAID'
  const isVerifying = bill.status === 'VERIFYING'
  const headerBg = isPaid ? '#22C55E' : isVerifying ? '#3B82F6' : '#F59E0B'
  const [showPreview, setShowPreview] = useState(false)

  return (
    <View style={s.card}>
      {showPreview && (
        <BillPreviewModal
          bill={bill}
          onClose={() => setShowPreview(false)}
          onPay={() => { setShowPreview(false); onPay(bill) }}
        />
      )}

      {/* Header */}
      <View style={[s.cardHeader, { backgroundColor: headerBg }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={s.headerProp}>{bill.propertyName}</Text>
          </View>
          <BillStatusBadge status={bill.status} />
        </View>
        <Text style={s.headerPeriod}>บิลรอบ {bill.billingPeriod}</Text>
        <View style={s.headerSubRow}>
          <Ionicons name="person-outline" size={11} color="rgba(255,255,255,0.9)" />
          <Text style={s.headerSub}>{bill.firstName} {bill.lastName}</Text>
          <Text style={s.headerDot}>•</Text>
          <Ionicons name="home-outline" size={11} color="rgba(255,255,255,0.9)" />
          <Text style={s.headerSub}>ห้อง {bill.roomNumber}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={s.cardBody}>
        {bill.items.map((item, i) => {
          const ico = itemIcon(item.title)
          return (
            <View key={i} style={[s.row, i < bill.items.length - 1 && s.rowBorder]}>
              <View style={s.rowLeft}>
                <Ionicons name={ico.name} size={14} color={ico.color} />
                <Text style={s.rowLabel}>{item.title}</Text>
              </View>
              <Text style={s.rowVal}>{formatAmount(item.amount)} ฿</Text>
            </View>
          )
        })}
      </View>

      {/* Total */}
      <View style={s.totalBlock}>
        <Text style={s.totalLabel}>รวมทั้งหมด</Text>
        <Text style={s.totalVal}>{formatAmount(bill.total)} ฿</Text>
      </View>

      {/* Due date / status info */}
      {bill.dueDate && !isPaid && !isVerifying && (
        <View style={s.dueRow}>
          <Ionicons name="alarm-outline" size={13} color="#B91C1C" />
          <Text style={s.dueText}>ครบกำหนด {bill.dueDate}</Text>
        </View>
      )}
      {isPaid && (
        <View style={[s.dueRow, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="checkmark-circle" size={13} color="#15803D" />
          <Text style={[s.dueText, { color: '#15803D' }]}>ชำระเรียบร้อยแล้ว</Text>
        </View>
      )}
      {isVerifying && (
        <View style={[s.dueRow, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="search-outline" size={13} color="#1D4ED8" />
          <Text style={[s.dueText, { color: '#1D4ED8' }]}>กำลังตรวจสอบหลักฐานการชำระ</Text>
        </View>
      )}

      {/* Footer buttons */}
      <View style={s.cardFooter}>
        <TouchableOpacity style={s.btnOutline} onPress={() => setShowPreview(true)}>
          <Ionicons name="eye-outline" size={14} color="#7C5CFC" />
          <Text style={s.btnOutlineText}>เปิดดูบิล</Text>
        </TouchableOpacity>
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

  const firstUnpaid = bills.find(b => b.status === 'PENDING' || b.status === 'VERIFYING')

  if (loading) return <ActivityIndicator color="#7C5CFC" style={{ marginTop: 60 }} />

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Summary banner */}
      {totalUnpaid > 0 && (
        <View style={s.summaryCard}>
          <View>
            <View style={s.summaryIconRow}>
              <Ionicons name="wallet-outline" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={s.summaryLabel}>ยอดค้างชำระ</Text>
            </View>
            <Text style={s.summaryAmount}>{formatAmount(totalUnpaid)} ฿</Text>
          </View>
          {firstUnpaid && (
            <TouchableOpacity style={s.summaryBtn} onPress={() => handlePay(firstUnpaid)}>
              <Text style={s.summaryBtnText}>ชำระเงิน</Text>
              <Ionicons name="arrow-forward" size={13} color="#F97316" />
            </TouchableOpacity>
          )}
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

  // Summary banner
  summaryCard: {
    backgroundColor: '#F97316', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  summaryIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  summaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  summaryBtnText: { fontSize: 13, fontWeight: '700', color: '#F97316' },

  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  cardHeader: { padding: 14, gap: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerProp: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  headerPeriod: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  headerDot: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  // Items
  cardBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.07)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 13, color: '#374151' },
  rowVal: { fontSize: 13, fontWeight: '600', color: '#1F1D2E' },

  // Total
  totalBlock: {
    marginHorizontal: 14, marginVertical: 10,
    backgroundColor: '#7C5CFC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#fff' },

  // Due / status
  dueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: '#FEF2F2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  dueText: { fontSize: 12, color: '#B91C1C', fontWeight: '500' },

  // Footer
  cardFooter: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingBottom: 14,
  },
  btnOutline: {
    flex: 1, height: 42, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnOutlineText: { fontSize: 13, fontWeight: '600', color: '#7C5CFC' },
  btnFill: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnFillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
})

const m = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F3FF',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1F1D2E' },

  // Bill sheet (capturable)
  billSheet: { backgroundColor: '#fff', padding: 16, borderRadius: 12, gap: 0 },
  propHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  propName: { fontSize: 16, fontWeight: '700', color: '#1F1D2E' },
  propAddr: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  badge: { backgroundColor: '#7C5CFC', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-end' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dateStr: { fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },

  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12, marginBottom: 14, gap: 10,
  },
  infoCell: { width: '47%' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
  infoVal: { fontSize: 12, fontWeight: '700', color: '#1F1D2E' },

  tableHead: {
    flexDirection: 'row', backgroundColor: '#1F1D2E',
    paddingHorizontal: 8, paddingVertical: 8, borderRadius: 6, marginBottom: 2,
  },
  th: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tableRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  td: { fontSize: 11, color: '#1F1D2E' },
  meterNote: { fontSize: 10, color: '#7C5CFC', marginTop: 2 },

  totalRow: {
    flexDirection: 'row', backgroundColor: '#F5F3FF',
    paddingHorizontal: 8, paddingVertical: 12,
    borderRadius: 6, marginTop: 4, marginBottom: 14,
  },
  totalText: { fontSize: 13, fontWeight: '700', color: '#7C5CFC' },

  section: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 8, padding: 12, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#7C5CFC', marginBottom: 8 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  payKey: { fontSize: 11, color: '#9CA3AF' },
  payVal: { fontSize: 11, fontWeight: '600', color: '#1F1D2E' },
  qr: { width: 72, height: 72, borderRadius: 4, marginLeft: 12 },
  noteText: { fontSize: 11, color: '#6B7280', marginTop: 3 },

  // Footer action buttons
  footer: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#F5F3FF',
    backgroundColor: '#fff',
  },
  actionBtn: { flex: 1, height: 44, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnOutline: { borderWidth: 1.5, borderColor: '#7C5CFC' },
  actionBtnOutlineText: { fontSize: 12, fontWeight: '600', color: '#7C5CFC' },
  actionBtnFill: { backgroundColor: '#7C5CFC' },
  actionBtnFillText: { fontSize: 12, fontWeight: '600', color: '#fff' },
})
