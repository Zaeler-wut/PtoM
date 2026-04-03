import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "expo-router"
import { loginSchema, type LoginFormValues } from "../../src/schemas/auth.schema"
import { useAuth } from "../../src/hooks/useAuth"
import LoginScreen from "../../src/screens/auth/LoginScreen"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clear } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginFormValues) => {
    const result = await login(data)
    if (login.fulfilled.match(result)) {
      router.replace("/(app)/properties")
    }
  }

  return (
    <LoginScreen
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      onClearError={clear}
    />
  )
}
