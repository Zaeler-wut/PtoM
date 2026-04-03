import { View, Text } from "react-native"
import type { BookingListItem } from "../../types/booking.types"

export interface BookingListScreenProps {
  bookings: BookingListItem[]
  isLoading: boolean
  onRefresh: () => void
  onConfirm: (bookingId: string) => void
  onCancel: (bookingId: string) => void
}

export default function BookingListScreen({ bookings, isLoading }: BookingListScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">BookingListScreen — รอ UI</Text>
    </View>
  )
}
