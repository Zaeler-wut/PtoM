import { View, Text } from "react-native"
import type { UseFormReturn } from "react-hook-form"
import type { BillingTableRow, BillingSummaryCards } from "../../types/billing.types"
import type { UpdateMeterFormValues } from "../../schemas/billing.schema"

export interface BillingScreenProps {
  bills: BillingTableRow[]
  summary: BillingSummaryCards | null
  isLoading: boolean
  month: number
  year: number
  onChangeMonth: (month: number) => void
  onChangeYear: (year: number) => void
  form: UseFormReturn<UpdateMeterFormValues>
  onUpdateMeter: (contractId: string, data: UpdateMeterFormValues) => Promise<void>
  onSendBill: (contractId: string) => Promise<void>
  onRefresh: () => void
}

export default function BillingScreen({ bills, isLoading }: BillingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">BillingScreen — รอ UI</Text>
    </View>
  )
}
