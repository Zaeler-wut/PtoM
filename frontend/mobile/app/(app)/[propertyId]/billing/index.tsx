import { useEffect, useState, useCallback } from "react"
import { useLocalSearchParams } from "expo-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "../../../../src/api/axiosInstance"
import { ENDPOINTS } from "../../../../src/api/endpoints"
import BillingScreen from "../../../../src/screens/billing/BillingScreen"
import { updateMeterSchema, type UpdateMeterFormValues } from "../../../../src/schemas/billing.schema"
import type { BillingTableRow, BillingSummaryCards } from "../../../../src/types/billing.types"

export default function BillingPage() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [bills, setBills] = useState<BillingTableRow[]>([])
  const [summary, setSummary] = useState<BillingSummaryCards | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<UpdateMeterFormValues>({
    resolver: zodResolver(updateMeterSchema),
    defaultValues: { waterMeter: 0, electricMeter: 0 },
  })

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    api.get(ENDPOINTS.billing.summary(propertyId), { params: { month, year } })
      .then((res) => { setBills(res.data.bills); setSummary(res.data.summary) })
      .finally(() => setIsLoading(false))
  }, [propertyId, month, year])

  useEffect(() => { load() }, [load])

  const handleUpdateMeter = async (contractId: string, data: UpdateMeterFormValues) => {
    await api.put(ENDPOINTS.billing.updateMeter(propertyId!, contractId), data)
    load()
  }

  const handleSendBill = async (contractId: string) => {
    await api.post(ENDPOINTS.billing.sendBill(propertyId!, contractId))
    load()
  }

  return (
    <BillingScreen
      bills={bills}
      summary={summary}
      isLoading={isLoading}
      month={month}
      year={year}
      onChangeMonth={setMonth}
      onChangeYear={setYear}
      form={form}
      onUpdateMeter={handleUpdateMeter}
      onSendBill={handleSendBill}
      onRefresh={load}
    />
  )
}
