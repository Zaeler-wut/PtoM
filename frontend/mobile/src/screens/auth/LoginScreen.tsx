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
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { router } from 'expo-router'

import FormInput from '../../components/form/FormInput'
import Button from '../../components/ui/Button'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginThunk, clearError } from '../../store/slices/authSlice'

// ─── Schema ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
})

type LoginForm = z.infer<typeof loginSchema>

// ─── Component ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector(state => state.auth)

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [])

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      router.replace('/' as any)
    }
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
            <Text style={styles.brandTitle}>PtoM</Text>
            <Text style={styles.brandSub}>Property Management</Text>
          </View>

          <View style={styles.tabRow}>
            <View style={[styles.tabBtn, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>เข้าสู่ระบบ</Text>
            </View>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => router.push('../(auth)/register')}
              activeOpacity={0.7}
            >
              <Text style={styles.tabText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>

          <FormInput<LoginForm>
            name="email"
            control={control}
            label="อีเมล"
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <FormInput<LoginForm>
            name="password"
            control={control}
            label="รหัสผ่าน"
            placeholder="••••••••"
            secureToggle
          />



          {error && <Text style={styles.apiError}>{error}</Text>}

          <Button
            label="เข้าสู่ระบบ"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>ยังไม่มีบัญชี? </Text>
            <TouchableOpacity onPress={() => router.push('../(auth)/register')}>
              <Text style={styles.switchLink}>สมัครสมาชิก</Text>
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
  forgot: { alignSelf: 'flex-end', marginBottom: 12, marginTop: 4 },
  forgotText: { fontSize: 12, color: '#A78BFA' },
  apiError: { fontSize: 12, color: '#F87171', textAlign: 'center', marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  switchText: { fontSize: 12, color: '#8B8A9B' },
  switchLink: { fontSize: 12, color: '#A78BFA', fontWeight: '500' },
})