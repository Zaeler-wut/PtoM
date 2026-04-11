import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutThunk } from '../../store/slices/authSlice'
import api from '../../api/axiosInstance'

const MOCK_ROOM = {
  propertyName: 'Purple Residence',
  roomNumber: '301',
  roomType: 'Deluxe',
  moveInDate: '01 ตุลาคม 2025',
  rentPerMonth: 6500,
}

const MOCK_BILL_STATS = {
  total: 2,
  paid: 1,
  pending: 1,
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const [editVisible, setEditVisible] = useState(false)
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutThunk())
          router.replace('/(auth)/login' as any)
        },
      },
    ])
  }

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อและนามสกุล')
      return
    }
    setIsSaving(true)
    try {
      await api.put('/mobile/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      Alert.alert('สำเร็จ', 'อัปเดตชื่อเรียบร้อย')
      setEditVisible(false)
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตชื่อได้')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header — พื้นขาว เหมือน FinanceScreen */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์ของฉัน</Text>
        </View>

        {/* userCard */}
        <View style={styles.userCardWrap}>
          <View style={styles.userCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={styles.userName}>{user?.name ?? '-'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setFirstName(user?.name?.split(' ')[0] ?? '')
                  setLastName(user?.name?.split(' ').slice(1).join(' ') ?? '')
                  setEditVisible(true)
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={16} color="rgba(255,255,255,0.75)" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <Ionicons name="mail-outline" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={styles.userEmail}>{user?.email ?? '-'}</Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'ADMIN' ? 'แอดมิน' : 'ผู้เช่า'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {/* ห้องพักปัจจุบัน */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="business" size={18} color="#7C5CFC" />
              </View>
              <Text style={styles.sectionTitle}>ห้องพักปัจจุบัน</Text>
            </View>

            <View style={styles.roomInfoCard}>
              <View style={styles.roomInfoRow}>
                <Ionicons name="home-outline" size={16} color="#9CA3AF" />
                <View>
                  <Text style={styles.roomInfoLabel}>สถานที่</Text>
                  <Text style={styles.roomInfoVal}>{MOCK_ROOM.propertyName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.roomGridRow}>
              <View style={styles.roomGridCard}>
                <Text style={styles.roomGridLabel}>หมายเลขห้อง</Text>
                <Text style={styles.roomGridVal}>{MOCK_ROOM.roomNumber}</Text>
              </View>
              <View style={styles.roomGridCard}>
                <Text style={styles.roomGridLabel}>ประเภทห้อง</Text>
                <Text style={styles.roomGridVal}>{MOCK_ROOM.roomType}</Text>
              </View>
            </View>

            <View style={styles.roomInfoCard}>
              <View style={styles.roomInfoRow}>
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <View>
                  <Text style={styles.roomInfoLabel}>วันที่เข้าอยู่</Text>
                  <Text style={styles.roomInfoVal}>{MOCK_ROOM.moveInDate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rentCard}>
              <Text style={styles.rentLabel}>ค่าเช่ารายเดือน</Text>
              <Text style={styles.rentVal}>{MOCK_ROOM.rentPerMonth.toLocaleString('th-TH')} ฿</Text>
            </View>
          </View>

          {/* Bill stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="document-text" size={20} color="#7C5CFC" />
              </View>
              <Text style={styles.statNum}>{MOCK_BILL_STATS.total}</Text>
              <Text style={styles.statLabel}>บิลทั้งหมด</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.statNum}>{MOCK_BILL_STATS.paid}</Text>
              <Text style={styles.statLabel}>ชำระแล้ว</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="card" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statNum}>{MOCK_BILL_STATS.pending}</Text>
              <Text style={styles.statLabel}>รอชำระ</Text>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menuSection}>
            <MenuItem
              icon="document-text-outline"
              label="การเงินและเอกสาร"
              bg="#EDE9FE"
              color="#7C5CFC"
              active
              onPress={() => router.push('/(app)/(tenant)/finance' as any)}
            />
            <MenuItem
              icon="location-outline"
              label="ค้นหาห้องพัก"
              bg="#EDE9FE"
              color="#7C5CFC"
              onPress={() => {}}
            />
            <MenuItem
              icon="calendar-outline"
              label="การจองของฉัน"
              bg="#EDE9FE"
              color="#7C5CFC"
              onPress={() => {}}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>แก้ไขชื่อ</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>ชื่อ</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="ชื่อ"
              placeholderTextColor="#C4B5FD"
            />
            <Text style={styles.inputLabel}>นามสกุล</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="นามสกุล"
              placeholderTextColor="#C4B5FD"
            />
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleSaveName}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>บันทึก</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function MenuItem({
  icon, label, onPress, bg, color, active,
}: {
  icon: any; label: string; onPress: () => void
  bg: string; color: string; active?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, active && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : bg }]}>
        <Ionicons name={icon} size={18} color={active ? '#fff' : color} />
      </View>
      <Text style={[styles.menuLabel, active && { color: '#fff' }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={active ? 'rgba(255,255,255,0.7)' : '#9CA3AF'} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },

  header: {
    backgroundColor: '#7C5CFC',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  userCardWrap: { paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  userCard: { backgroundColor: '#7C5CFC', borderRadius: 16, padding: 16 },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  roleBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 },

  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F1D2E' },

  roomInfoCard: { backgroundColor: '#F9F7FF', borderRadius: 12, padding: 12 },
  roomInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomInfoLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  roomInfoVal: { fontSize: 14, fontWeight: '500', color: '#1F1D2E' },

  roomGridRow: { flexDirection: 'row', gap: 10 },
  roomGridCard: { flex: 1, backgroundColor: '#F9F7FF', borderRadius: 12, padding: 12 },
  roomGridLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  roomGridVal: { fontSize: 18, fontWeight: '700', color: '#7C5CFC' },

  rentCard: {
    backgroundColor: '#7C5CFC', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  rentLabel: { fontSize: 14, fontWeight: '500', color: '#fff' },
  rentVal: { fontSize: 18, fontWeight: '700', color: '#fff' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4, height: 120,
  },
  statNum: { fontSize: 20, fontWeight: '700', color: '#1F1D2E' },
  statLabel: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },

  menuSection: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#F5F3FF', gap: 12,
  },
  menuItemActive: { backgroundColor: '#7C5CFC' },
  menuLabel: { flex: 1, fontSize: 14, color: '#1F1D2E', fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 16, borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', paddingTop: 60, paddingHorizontal: 20,
  },
  modalSheet: { backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 28 },
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