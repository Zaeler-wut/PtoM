// contractRepository.ts (mobile) — query database สำหรับ contract module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก contractService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงสัญญาทั้งหมดของ user เรียงล่าสุดก่อน
// include: ห้องพักและชื่อ property — ใช้แสดงใน MyContractItem
export const getMyContracts = async (userId: string) => {
  return prisma.contract.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          property: { select: { name: true } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  })
}
