import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function PropertyLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#7c3aed" }}>
      <Tabs.Screen name="dashboard" options={{ title: "ภาพรวม", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="rooms/index" options={{ title: "ห้องพัก", tabBarIcon: ({ color, size }) => <Ionicons name="bed-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="tenants/index" options={{ title: "ผู้เช่า", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="billing/index" options={{ title: "บิล", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings/index" options={{ href: null }} />
      <Tabs.Screen name="contracts/index" options={{ href: null }} />
      <Tabs.Screen name="move-out/index" options={{ href: null }} />
    </Tabs>
  )
}
