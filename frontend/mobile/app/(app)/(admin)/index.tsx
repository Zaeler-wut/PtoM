import { Redirect } from 'expo-router'

// Admin ใช้ (tenant) layout เหมือนกัน แค่มีแท็บจดมิเตอร์เพิ่ม
export default function AdminRedirect() {
  return <Redirect href={'/(app)/(tenant)' as any} />
}
