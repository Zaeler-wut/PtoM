// propertyApi.ts (web) — API calls สำหรับจัดการ property ฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก propertySlice.ts และ component ที่เกี่ยวข้อง

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Property, PropertyListItem, CreatePropertyPayload } from "../../types/property.types"

export const propertyApi = {
  // GET /api/admin/properties — ดึง property ทั้งหมดของ admin ที่ login อยู่
  getList: async (): Promise<PropertyListItem[]> => {
    const { data } = await api.get<PropertyListItem[]>(ENDPOINTS.properties.list)
    return data
  },

  // GET /api/admin/properties/:id — ดึงข้อมูล property ฉบับเต็ม
  getDetail: async (propertyId: string): Promise<Property> => {
    const { data } = await api.get<Property>(ENDPOINTS.properties.detail(propertyId))
    return data
  },

  // PUT /api/admin/properties/:id — แก้ไข property
  update: async (propertyId: string, payload: any): Promise<Property> => {
    const { data } = await api.put<Property>(ENDPOINTS.properties.update(propertyId), payload)
    return data
  },

  // POST /api/admin/properties/:id/images — เพิ่มรูป property
  addImages: async (propertyId: string, urls: string[]): Promise<void> => {
    await api.post(ENDPOINTS.properties.images(propertyId), { urls })
  },

  // DELETE /api/admin/properties/:id/images/:imgId — ลบรูป property
  deleteImage: async (propertyId: string, imageId: string): Promise<void> => {
    await api.delete(ENDPOINTS.properties.deleteImage(propertyId, imageId))
  },

  // PATCH /api/admin/properties/:id/images/:imgId/cover — ตั้งรูป cover
  setCover: async (propertyId: string, imageId: string): Promise<void> => {
    await api.patch(ENDPOINTS.properties.setCover(propertyId, imageId))
  },

  // POST /api/admin/properties — สร้าง property ใหม่
  create: async (payload: CreatePropertyPayload): Promise<Property> => {
    const { data } = await api.post<Property>(ENDPOINTS.properties.create, payload)
    return data
  },

  // DELETE /api/admin/properties/:id — ลบ property และทุกอย่างในนั้น
  delete: async (propertyId: string): Promise<void> => {
    await api.delete(ENDPOINTS.properties.delete(propertyId))
  },
}
