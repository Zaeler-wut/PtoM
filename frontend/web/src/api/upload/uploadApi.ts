// uploadApi.ts (web) — API calls สำหรับ upload รูปภาพ
// เรียกใช้ axiosInstance ส่งไป /upload/image หรือ /upload/images
// ถูกเรียกใช้จาก component ที่ต้องการ upload รูปก่อนส่ง URL ไปบันทึก

import api from "../axiosInstance"

export const uploadApi = {
  // POST /upload/image?folder= — อัพโหลดรูปเดียว รับ URL กลับ
  uploadImage: async (file: File, folder?: string): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await api.post<{ url: string }>(
      `/upload/image${folder ? `?folder=${folder}` : ""}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return data.url
  },

  // POST /upload/images?folder= — อัพโหลดหลายรูปพร้อมกัน รับ URLs[] กลับ
  uploadImages: async (files: File[], folder?: string): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((f) => formData.append("files", f))

    const { data } = await api.post<{ urls: string[] }>(
      `/upload/images${folder ? `?folder=${folder}` : ""}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return data.urls
  },
}
