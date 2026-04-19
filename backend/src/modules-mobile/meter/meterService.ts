// meterService.ts (mobile) — business logic สำหรับ meter module ฝั่ง mobile
// รับข้อมูลจาก meterRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ meterRepository สำหรับ query database

import * as repo from "./meterRepository"

// ข้อมูลที่พักสำหรับแสดงในหน้าเลือกที่พักของ admin (mobile)
export interface AdminPropertyCard {
  id: string
  name: string
  coverImage: string | null
  totalRooms: number
  roomTypeNames: string[]
}

// ดึงที่พักที่ admin คนนี้ดูแล — กรองและ format สำหรับแสดงใน mobile
// เรียก: meterRepository.getAdminProperties()
// ส่งกลับ: array ของ AdminPropertyCard
export const getAdminProperties = async (userId: string): Promise<AdminPropertyCard[]> => {
  const properties = await repo.getAdminProperties(userId)

  return properties.map((p) => {
    const coverImage =
      p.images.find((img) => img.isCover)?.url || p.images[0]?.url || null

    // deduplicate ชื่อ roomType ด้วย Set
    const roomTypeNames = Array.from(new Set(p.roomTypes.map((rt) => rt.name)))

    return {
      id: p.id,
      name: p.name,
      coverImage,
      totalRooms: p.rooms.length,
      roomTypeNames,
    }
  })
}

// ดึงห้องทั้งหมดใน property พร้อมค่ามิเตอร์เดือนที่ระบุ
// เรียก: meterRepository.getRoomsWithMeter()
// ส่งกลับ: array ของห้องพร้อม electricMeter, waterMeter (null ถ้ายังไม่ได้กรอก)
export const getRoomsForMeter = async (
  propertyId: string,
  month: number,
  year: number
) => {
  const rooms = await repo.getRoomsWithMeter(propertyId, month, year)

  return rooms.map((r) => ({
    id: r.id,
    roomNumber: r.roomNumber,
    floor: r.floor,
    roomTypeName: r.roomType.name,
    electricMeter: r.meters[0]?.electricMeter ?? null,
    waterMeter: r.meters[0]?.waterMeter ?? null,
  }))
}

// บันทึก/แก้ไขค่ามิเตอร์ห้องเดียว — upsert ตาม roomId+month+year
// เรียก: meterRepository.upsertMeterReading()
// ส่งกลับ: MeterReading record ที่บันทึก
export const saveMeterReading = async (data: {
  roomId: string
  month: number
  year: number
  waterMeter: number
  electricMeter: number
}) => {
  return repo.upsertMeterReading(data)
}
