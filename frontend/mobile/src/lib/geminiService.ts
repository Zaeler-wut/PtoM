import axios from 'axios'
import { getAccessToken } from '../api/axiosInstance'

// axios instance แยกสำหรับ AI เพื่อให้ timeout ยาวพอ (ไม่ใช้ global 10s)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api'
const aiApi = axios.create({ baseURL: BASE_URL, timeout: 120000 })
aiApi.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type MeterType = 'electric' | 'water'

export interface GeminiMeterResult {
  roomNumber: string | null
  meterValue: number | null
  type: MeterType
}

function getMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  return 'image/jpeg'
}

type ImagePayload = { base64: string; mimeType: string; type: MeterType }

async function sendOne(image: ImagePayload): Promise<GeminiMeterResult> {
  const response = await aiApi.post<GeminiMeterResult[]>('/mobile/admin/meter/ai-read', { images: [image] })
  return response.data[0]
}

export async function readMetersFromImages(
  electricImages: Array<{ uri: string; base64: string }>,
  waterImages: Array<{ uri: string; base64: string }>,
  onProgress?: (done: number, total: number) => void,
): Promise<GeminiMeterResult[]> {
  const allImages: ImagePayload[] = [
    ...electricImages.map(img => ({
      base64: img.base64,
      mimeType: getMimeType(img.uri),
      type: 'electric' as MeterType,
    })),
    ...waterImages.map(img => ({
      base64: img.base64,
      mimeType: getMimeType(img.uri),
      type: 'water' as MeterType,
    })),
  ]

  const total = allImages.length
  const results: GeminiMeterResult[] = []

  for (let i = 0; i < total; i++) {
    results.push(await sendOne(allImages[i]))
    onProgress?.(i + 1, total)
  }

  return results
}
