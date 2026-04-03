import { View, Text } from "react-native"
import type { UseFormReturn } from "react-hook-form"
import type { ContractListItem } from "../../types/contract.types"
import type { UpdateContractFormValues } from "../../schemas/contract.schema"

export interface ContractListScreenProps {
  contracts: ContractListItem[]
  isLoading: boolean
  onRefresh: () => void
  form: UseFormReturn<UpdateContractFormValues>
  onUpdateContract: (contractId: string, data: UpdateContractFormValues) => Promise<void>
}

export default function ContractListScreen({ contracts, isLoading }: ContractListScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">ContractListScreen — รอ UI</Text>
    </View>
  )
}
