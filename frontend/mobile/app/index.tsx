import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useAppSelector } from "../src/store/hooks"

export default function Index() {
  const { isRestored, user } = useAppSelector((s) => s.auth)

  if (!isRestored) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    )
  }

  if (user) {
    return <Redirect href={"/(app)/properties" as any} />
  }

  return <Redirect href={"/(auth)/login" as any} />
}
