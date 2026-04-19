// contractModel.ts (mobile) — TypeScript types สำหรับ contract module ฝั่ง mobile
// ใช้เป็น return type ของ contractService และ contractRouter

// ข้อมูลสัญญาหนึ่งรายการสำหรับแสดงในหน้า "สัญญาของฉัน"
export interface MyContractItem {
  contractId: string
  propertyName: string
  roomNumber: string
  contractDuration: string  // เช่น "12 เดือน" หรือ "1 ปี 6 เดือน"
  startDate: string         // YYYY-MM-DD
  endDate: string           // YYYY-MM-DD
  status: ContractStatus
  pdfUrl: string | null     // URL สัญญา PDF — null ถ้ายังไม่ generate
}

// สถานะสัญญาที่แสดงฝั่ง mobile (ไม่รวม DRAFT)
export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
