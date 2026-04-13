import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '../../../src/store/hooks'

export default function TenantLayout() {
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#EDE9FE',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7C5CFC',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าหลัก',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'การเงิน',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      {/* แสดงเฉพาะ ADMIN */}
      <Tabs.Screen
        name="meter"
        options={{
          title: 'จดมิเตอร์',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      {/* ซ่อน dynamic routes */}
      <Tabs.Screen name="property/[id]" options={{ href: null }} />
      <Tabs.Screen name="room/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking-summary/[id]" options={{ href: null }} />
      <Tabs.Screen name="payment/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking-success/[id]" options={{ href: null }} />
    </Tabs>
  )
}
