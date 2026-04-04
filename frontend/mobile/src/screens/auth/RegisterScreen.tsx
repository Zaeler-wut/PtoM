import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { router } from 'expo-router'

import FormInput from '../../components/form/FormInput'
import Button from '../../components/ui/Button'

// TODO: เพิ่ม registerThunk ใน authSlice แล้ว import มาใช้แทน
// import { useAppDispatch, useAppSelector } from '@/store/hooks'
// import { registerThunk, clearError } from '@/store/slices/authSlice'

// ─── Schema ────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

// ─── Password strength ─────────────────────────────────────────────────────
function getStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthColor = ['#22222C', '#F87171', '#FBBF24', '#34D399', '#34D399']

// ─── Component ─────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  // TODO: uncomment เมื่อมี registerThunk
  // const dispatch = useAppDispatch()
  // const { isLoading, error } = useAppSelector(state => state.auth)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = useWatch({ control, name: 'password' })
  const strength = getStrength(passwordValue)

  const onSubmit = async (data: RegisterForm) => {
    const { confirmPassword, ...payload } = data

    // TODO: แทนที่ด้วย dispatch(registerThunk(payload)) เมื่อมี thunk
    // const result = await dispatch(registerThunk(payload))
    // if (registerThunk.fulfilled.match(result)) {
    //   router.replace('/(app)/properties')
    // }

    console.log('register payload:', payload)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>⊞</Text>
            </View>
            <Text style={styles.brandTitle}>PropSpace</Text>
            <Text style={styles.brandSub}>สร้างบัญชีใหม่</Text>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.tabText}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
            <View style={[styles.tabBtn, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>สมัครสมาชิก</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput<RegisterForm>
                name="firstName"
                control={control}
                label="ชื่อ"
                placeholder="สมชาย"
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <FormInput<RegisterForm>
                name="lastName"
                control={control}
                label="นามสกุล"
                placeholder="ใจดี"
              />
            </View>
          </View>

          <FormInput<RegisterForm>
            name="email"
            control={control}
            label="อีเมล"
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <FormInput<RegisterForm>
            name="password"
            control={control}
            label="รหัสผ่าน"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            secureToggle
          />

          <View style={styles.strengthRow}>
            {[1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: i <= strength ? strengthColor[strength] : '#22222C' },
                ]}
              />
            ))}
          </View>

          <FormInput<RegisterForm>
            name="confirmPassword"
            control={control}
            label="ยืนยันรหัสผ่าน"
            placeholder="••••••••"
            secureToggle
          />

          <Button
            label="สร้างบัญชี"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{ marginTop: 4 }}
          />

          <Text style={styles.terms}>
            การสมัครถือว่าคุณยอมรับ{' '}
            <Text style={styles.termsLink}>เงื่อนไขการใช้งาน</Text>
            {' '}และ{' '}
            <Text style={styles.termsLink}>นโยบายความเป็นส่วนตัว</Text>
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>มีบัญชีแล้ว? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.switchLink}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  brand: { marginTop: 32, marginBottom: 28 },
  brandIcon: {
    width: 44, height: 44, backgroundColor: '#6C63FF',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  brandIconText: { fontSize: 20, color: '#fff' },
  brandTitle: { fontSize: 26, fontWeight: '700', color: '#F1F0F5', letterSpacing: -0.5 },
  brandSub: { fontSize: 13, color: '#8B8A9B', marginTop: 3 },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#22222C',
    borderRadius: 999, padding: 4, marginBottom: 24,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  tabText: { fontSize: 13, fontWeight: '500', color: '#8B8A9B' },
  tabTextActive: { color: '#fff' },
  row: { flexDirection: 'row' },
  strengthRow: {
    flexDirection: 'row', gap: 4,
    marginTop: -8, marginBottom: 14, paddingHorizontal: 6,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  terms: { fontSize: 11, color: '#8B8A9B', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  termsLink: { color: '#A78BFA' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  switchText: { fontSize: 12, color: '#8B8A9B' },
  switchLink: { fontSize: 12, color: '#A78BFA', fontWeight: '500' },
})