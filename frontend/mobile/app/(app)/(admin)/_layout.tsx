import { Stack } from 'expo-router'

// Admin screens redirect to (tenant) — ดู index.tsx
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
