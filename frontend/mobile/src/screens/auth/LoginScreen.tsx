import { View, Text } from "react-native"
import type { UseFormReturn } from "react-hook-form"
import type { LoginFormValues } from "../../schemas/auth.schema"

export interface LoginScreenProps {
  form: UseFormReturn<LoginFormValues>
  onSubmit: () => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

// TODO: UI คนมาใส่ JSX ตรงนี้
export default function LoginScreen({ form, onSubmit, isLoading, error }: LoginScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">LoginScreen — รอ UI</Text>
    </View>
  )
}
