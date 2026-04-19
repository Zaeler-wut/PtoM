// axiosInstance.ts — Axios instance หลักสำหรับ web admin
// จัดการ JWT access token ใน memory และ auto refresh เมื่อ token หมดอายุ (401)
// ถูก import โดย api/*.ts ทุกไฟล์

import axios from "axios"

// base instance — ทุก request ใช้ /api เป็น prefix และส่ง cookie ไปด้วย (สำหรับ refresh token)
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

// Request interceptor — แนบ accessToken จาก memory ใน Authorization header ทุก request
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// เก็บ access token ใน memory (ไม่เก็บใน localStorage เพื่อป้องกัน XSS)
let _accessToken: string | null = null

export const getAccessToken = () => _accessToken
export const setAccessToken = (token: string | null) => { _accessToken = token }

// Response interceptor — auto refresh token เมื่อได้รับ 401
// ใช้ queue เพื่อไม่ให้ refresh พร้อมกันหลาย request — request ที่รอจะ retry หลัง refresh สำเร็จ
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = []

// flush queue — resolve ทั้งหมดด้วย token ใหม่ หรือ reject ทั้งหมดถ้า refresh ล้มเหลว
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      // ถ้ากำลัง refresh อยู่แล้ว → ใส่ request นี้เข้า queue รอ token ใหม่
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        // เรียก refresh-token endpoint ด้วย cookie (httpOnly) — ได้ accessToken ใหม่กลับมา
        const res = await axios.post("/api/auth/refresh-token", {}, {
          withCredentials: true,
        })

        const newToken = res.data.accessToken
        if (!newToken) throw new Error("No token")
        setAccessToken(newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        // refresh ล้มเหลว → clear token และ redirect ไป /login
        processQueue(err, null)
        setAccessToken(null)
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
