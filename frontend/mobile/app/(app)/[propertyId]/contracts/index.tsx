import { useEffect, useState, useCallback } from "react"
import { useLocalSearchParams } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import ContractListScreen from "../../../../src/screens/contract/ContractListScreen"
import { updateContractSchema, type UpdateContractFormValues } from "../../../../src/schemas/contract.schema"
import type { ContractListItem } from "../../../../src/types/contract.types"

export default function ContractsPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const [contracts, setContracts] = useState<ContractListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<UpdateContractFormValues>({
    resolver: zodResolver(updateContractSchema),
    defaultValues: { status: "ACTIVE", firstName: "", lastName: "", email: "" },
  })

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.contracts.list(propertyId))
      .then((res) => setContracts(res.data))
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  const handleUpdate = async (contractId: string, data: UpdateContractFormValues) => {
    await api.put(ENDPOINTS.contracts.update(propertyId!, contractId), data)
    load()
  }

  return (
    <ContractListScreen
      contracts={contracts}
      isLoading={isLoading}
      onRefresh={load}
      form={form}
      onUpdateContract={handleUpdate}
    />
  )
}
