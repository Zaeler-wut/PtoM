// profileRepository.ts (mobile) — query database สำหรับ profile module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก profileService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงข้อมูล user พร้อม contracts ที่ยังมีผลและบิลทั้งหมด
// contracts: เฉพาะ ACTIVE, MOVE_OUT_NOTICE, ENDED — include ห้องและ roomType
// bills: เฉพาะ PENDING, VERIFYING, PAID — select แค่ status เพื่อสรุปจำนวน
export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      // สัญญา active ล่าสุด
      contracts: {
        where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE", "ENDED"] } },
        include: {
          room: {
            include: {
              property: { select: { name: true } },
              roomType: {
                select: {
                  name: true,
                  roomPrice: true,
                  furniturePrice: true,
                },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
      },
      // สรุปบิล — select แค่ status ไม่ดึงข้อมูลทั้งหมดเพื่อประหยัด bandwidth
      bills: {
        where: {
          status: { in: ["PENDING", "VERIFYING", "PAID"] },
        },
        select: { status: true },
      },
    },
  })
}

// อัพเดทข้อมูลส่วนตัว — trim whitespace ก่อนบันทึก
// ส่งกลับเฉพาะ fields ที่จำเป็น (ไม่ส่ง password hash กลับ)
export const updateUserProfile = async (
  userId: string,
  data: { firstName: string; lastName: string; phone?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  })
}
