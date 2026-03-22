import { useEffect, useState } from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import axios from "axios"
import { store } from "./store"
import { router } from "./routes"
import { setUser } from "./store/slices/authSlice"
import { setAccessToken } from "./api/axiosInstance"

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // ตอน app load → ลอง refresh token อัตโนมัติ
    // ถ้ามี refreshToken cookie อยู่ → ได้ accessToken ใหม่
    // ถ้าไม่มี → ไป login
    axios.post("/api/auth/refresh-token", {}, { withCredentials: true })
      .then((res) => {
        const { accessToken, user } = res.data
        setAccessToken(accessToken)
        store.dispatch(setUser({ accessToken, user }))
      })
      .catch(() => {
        // ไม่มี cookie หรือ expired → ไม่ต้องทำอะไร ProtectedRoute จะ redirect ไป login เอง
      })
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <RouterProvider router={router} />
      </AppInitializer>
    </Provider>
  )
}