import api from '../api/axiosInstance'

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

export async function readMetersFromImages(
  electricImages: Array<{ uri: string; base64: string }>,
  waterImages: Array<{ uri: string; base64: string }>,
): Promise<GeminiMeterResult[]> {
  const images = [
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

  const response = await api.post<GeminiMeterResult[]>('/mobile/admin/meter/ai-read', { images }, { timeout: 120000 })
  return response.data
}
