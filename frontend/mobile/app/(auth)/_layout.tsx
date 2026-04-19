import { Redirect, Stack } from "expo-router"
import { useAppSelector } from "../../src/store/hooks"

export default function AuthLayout() {
  const { user, isRestored } = useAppSelector((s) => s.auth)

  if (isRestored && user) {
    if (user.role === 'ADMIN') return <Redirect href={"/(app)/(admin)" as any} />
    return <Redirect href={"/(app)/(tenant)" as any} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}