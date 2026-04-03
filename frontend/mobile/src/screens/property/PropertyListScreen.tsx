import { View, Text } from "react-native"
import type { Property } from "../../types/property.types"

export interface PropertyListScreenProps {
  properties: Property[]
  isLoading: boolean
  onSelectProperty: (propertyId: string) => void
}

// TODO: UI คนมาใส่ JSX ตรงนี้
export default function PropertyListScreen({ properties, isLoading, onSelectProperty }: PropertyListScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-400">PropertyListScreen — รอ UI</Text>
    </View>
  )
}
