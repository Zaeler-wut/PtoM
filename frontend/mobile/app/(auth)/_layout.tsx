import { Redirect, Stack } from "expo-router"
import { useAppSelector } from "../../src/store/hooks"

export default function AuthLayout() {
  const { user, isRestored } = useAppSelector((s) => s.auth)

  if (isRestored && user) {
    return <Redirect href={"/(app)/properties" as any} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
