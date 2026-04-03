import { useEffect, useState, useCallback } from "react"
import { useLocalSearchParams } from "expo-router"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import MoveOutScreen from "../../../../src/screens/moveout/MoveOutScreen"
import type { MoveOutPendingItem, MoveOutCompletedItem } from "../../../../src/types/moveout.types"

export default function MoveOutPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [pending, setPending] = useState<MoveOutPendingItem[]>([])
  const [completed, setCompleted] = useState<MoveOutCompletedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.moveout.list(propertyId))
      .then((res) => { setPending(res.data.pending); setCompleted(res.data.completed) })
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  return (
    <MoveOutScreen
      pending={pending}
      completed={completed}
      isLoading={isLoading}
      onRefresh={load}
      propertyId={propertyId!}
    />
  )
}
