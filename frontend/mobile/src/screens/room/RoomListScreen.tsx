import { View, Text } from "react-native"
import type { Room } from "../../types/room.types"

export interface RoomListScreenProps {
  rooms: Room[]
  isLoading: boolean
  onRefresh: () => void
}

export default function RoomListScreen({ rooms, isLoading, onRefresh }: RoomListScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">RoomListScreen — รอ UI</Text>
    </View>
  )
}
