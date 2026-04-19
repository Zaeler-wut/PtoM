import { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import RoomListScreen from "../../../../src/screens/room/RoomListScreen"
import type { Room } from "../../../../src/types/room.types"

export default function RoomsPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.rooms.list(propertyId))
      .then((res) => setRooms(res.data))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [propertyId])

  return <RoomListScreen rooms={rooms} isLoading={isLoading} onRefresh={load} />
}
