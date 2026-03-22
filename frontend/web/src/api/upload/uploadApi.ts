import api from "../axiosInstance"

export const uploadApi = {
  // อัพโหลดรูปเดียว
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

  // อัพโหลดหลายรูป
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