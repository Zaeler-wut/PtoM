import { View, Text } from "react-native"
import type { DashboardSummary } from "../../types/dashboard.types"

export interface DashboardScreenProps {
  data: DashboardSummary | null
  isLoading: boolean
}

export default function DashboardScreen({ data, isLoading }: DashboardScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">DashboardScreen — รอ UI</Text>
    </View>
  )
}
