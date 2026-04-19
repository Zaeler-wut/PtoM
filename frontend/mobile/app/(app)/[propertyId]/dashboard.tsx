import { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import api from "../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../src/api/endpoints"
import DashboardScreen from "../../../src/screens/dashboard/DashboardScreen"
import type { DashboardSummary } from "../../../src/types/dashboard.types"

export default function DashboardPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.dashboard.summary(propertyId))
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false))
  }, [propertyId])

  return <DashboardScreen data={data} isLoading={isLoading} />
}
