// contractService.ts (mobile) — business logic สำหรับ contract module ฝั่ง mobile
// รับข้อมูลจาก contractRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ contractRepository สำหรับ query database

import * as repo from "./contractRepository"
import type { MyContractItem } from "./contractModel"

// ดึงสัญญาทั้งหมดของ tenant พร้อม format ระยะเวลาสัญญา
// คำนวณ contractDuration จาก endDate - startDate → แปลงเป็น "X ปี Y เดือน" หรือ "Z เดือน"
// เรียก: contractRepository.getMyContracts()
// ส่งกลับ: MyContractItem[]
export const getMyContracts = async (userId: string): Promise<MyContractItem[]> => {
  const contracts = await repo.getMyContracts(userId)

  return contracts.map((c) => {
    // คำนวณระยะเวลาสัญญาเป็นเดือน (ประมาณ 30 วัน/เดือน)
    const months = Math.round(
      (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    // แสดงเป็นปีถ้า >= 12 เดือน เช่น "1 ปี 6 เดือน" หรือ "1 ปี"
    const duration = months >= 12
      ? `${Math.floor(months / 12)} ปี${months % 12 > 0 ? ` ${months % 12} เดือน` : ""}`
      : `${months} เดือน`

    return {
      contractId: c.id,
      propertyName: c.room.property.name,
      roomNumber: c.room.roomNumber,
      contractDuration: duration,
      startDate: c.startDate.toISOString().split("T")[0],
      endDate: c.endDate.toISOString().split("T")[0],
      status: c.status as any,
      pdfUrl: c.pdfUrl,
    }
  })
}
