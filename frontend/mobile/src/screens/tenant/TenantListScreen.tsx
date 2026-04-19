import { View, Text } from "react-native"
import type { TenantListItem } from "../../types/tenant.types"

export interface TenantListScreenProps {
  tenants: TenantListItem[]
  isLoading: boolean
  onRefresh: () => void
}

export default function TenantListScreen({ tenants, isLoading, onRefresh }: TenantListScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">TenantListScreen — รอ UI</Text>
    </View>
  )
}
