import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutThunk } from '../../store/slices/authSlice'
import api from '../../api/axiosInstance'

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

        {/* Header */}
        <LinearGradient
          colors={['#9B6DFF', '#6C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>โปรไฟล์ของฉัน</Text>

          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0) ?? '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name ?? '-'}</Text>
                <Text style={styles.userEmail}>{user?.email ?? '-'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setFirstName(user?.name?.split(' ')[0] ?? '')
                  setLastName(user?.name?.split(' ').slice(1).join(' ') ?? '')
                  setEditVisible(true)
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={18} color="#7C5CFC" />
              </TouchableOpacity>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'ADMIN' ? 'แอดมิน' : 'ผู้เช่า'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>การเงินและเอกสาร</Text>
            <MenuItem icon="document-text-outline" label="การเงินและเอกสาร" onPress={() => {}} />
            <MenuItem
              icon="search-outline"
              label="ค้นหาห้องพัก"
              onPress={() => {
                if (user?.role === 'ADMIN') router.push('/(app)/(admin)' as any)
                else router.push('/(app)/(tenant)' as any)
              }}
            />
            <MenuItem icon="calendar-outline" label="การจองของฉัน" onPress={() => {}} />
          </View>

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

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={18} color="#7C5CFC" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },

  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#7C5CFC' },
  userName: { fontSize: 16, fontWeight: '700', color: '#1F1D2E' },
  userEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  roleBadgeText: { fontSize: 12, color: '#7C5CFC', fontWeight: '600' },

  body: {
    backgroundColor: '#F5F3FF',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#9CA3AF',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F5F3FF', gap: 12,
  },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#1F1D2E', fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FEF2F2', borderRadius: 16,
    paddingVertical: 16, marginTop: 8,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalSheet: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 24, paddingBottom: 28,
  },
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
    height: 50, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
