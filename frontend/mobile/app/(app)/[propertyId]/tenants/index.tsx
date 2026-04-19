import { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import TenantListScreen from "../../../../src/screens/tenant/TenantListScreen"
import type { TenantListItem } from "../../../../src/types/tenant.types"

export default function TenantsPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [tenants, setTenants] = useState<TenantListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.tenants.list(propertyId))
      .then((res) => setTenants(res.data))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [propertyId])

  return <TenantListScreen tenants={tenants} isLoading={isLoading} onRefresh={load} />
}
