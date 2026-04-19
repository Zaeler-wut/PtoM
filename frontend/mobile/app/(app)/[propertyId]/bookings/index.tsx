import { useEffect, useState, useCallback } from "react"
import { useLocalSearchParams } from "expo-router"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import BookingListScreen from "../../../../src/screens/booking/BookingListScreen"
import type { BookingListItem } from "../../../../src/types/booking.types"

export default function BookingsPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.bookings.list(propertyId))
      .then((res) => setBookings(res.data))
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  const handleConfirm = async (bookingId: string) => {
    await api.post(ENDPOINTS.bookings.confirm(propertyId!, bookingId))
    load()
  }

  const handleCancel = async (bookingId: string) => {
    await api.post(ENDPOINTS.bookings.cancel(propertyId!, bookingId))
    load()
  }

  return (
    <BookingListScreen
      bookings={bookings}
      isLoading={isLoading}
      onRefresh={load}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
