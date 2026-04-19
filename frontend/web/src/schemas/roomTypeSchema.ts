import { z } from 'zod'

const feeSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อค่าบริการ'),
  price: z.coerce.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export const roomTypeSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อประเภทห้อง'),
  description: z.string().optional().default(''),
  size: z.coerce.number().min(1, 'ขนาดต้องมากกว่า 0'),
  maxOccupants: z.coerce.number().min(1, 'จำนวนผู้พักต้องมากกว่า 0'),
  roomPrice: z.coerce.number().min(0, 'ราคาห้องต้องไม่ติดลบ'),
  furniturePrice: z.coerce.number().min(0).default(0),
  waterRate: z.coerce.number().min(0, 'อัตราค่าน้ำต้องไม่ติดลบ'),
  electricRate: z.coerce.number().min(0, 'อัตราค่าไฟต้องไม่ติดลบ'),
  bookingFee: z.coerce.number().min(0).default(0),
  advanceRent: z.coerce.number().min(0).default(0),
  securityDeposit: z.coerce.number().min(0).default(0),
  fees: z.array(feeSchema).default([]),
})

export type RoomTypeFormData = z.infer<typeof roomTypeSchema>
