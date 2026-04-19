import { View, Text } from "react-native"
import type { MoveOutPendingItem, MoveOutCompletedItem } from "../../types/moveout.types"

export interface MoveOutScreenProps {
  pending: MoveOutPendingItem[]
  completed: MoveOutCompletedItem[]
  isLoading: boolean
  onRefresh: () => void
  propertyId: string
}

export default function MoveOutScreen({ pending, completed, isLoading }: MoveOutScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">MoveOutScreen — รอ UI</Text>
    </View>
  )
}
