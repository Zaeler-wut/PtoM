import { useEffect, useRef, useState } from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import axios from "axios"
import { store } from "./store"
import { router } from "./routes"
import { setUser } from "./store/slices/authSlice"
import { setAccessToken } from "./api/axiosInstance"

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    // ป้องกัน React StrictMode รัน effect 2 รอบ → ส่ง request ซ้ำ
    if (fetched.current) return
    fetched.current = true

    // รองรับ impersonate token จาก superadmin
    const params = new URLSearchParams(window.location.search)
    const impersonateToken = params.get("impersonate")
    if (impersonateToken) {
      // ดึง user info จาก token payload
      try {
        const payload = JSON.parse(atob(impersonateToken.split(".")[1]))
        setAccessToken(impersonateToken)
        store.dispatch(setUser({
          accessToken: impersonateToken,
          user: { id: payload.id, name: payload.firstName || payload.email, email: payload.email, role: payload.role },
        }))
        // ลบ query param ออกจาก URL
        window.history.replaceState({}, "", window.location.pathname)
      } catch {}
      setReady(true)
      return
    }

    axios.post("/api/auth/refresh-token", {}, { withCredentials: true })
      .then((res) => {
        const { accessToken, user } = res.data
        if (accessToken) {
          setAccessToken(accessToken)
          store.dispatch(setUser({ accessToken, user }))
        }
      })
      .catch(() => {})
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