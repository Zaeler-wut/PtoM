import { z } from 'zod'

export const createContractSchema = z.object({
  bookingId: z.string().optional(),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('อีเมลไม่ถูกต้อง'),
  phone: z.string().optional(),
  lineId: z.string().optional(),
  houseNumber: z.string().optional(),
  soi: z.string().optional(),
  road: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  roomId: z.string().min(1, 'กรุณาเลือกห้อง'),
  startDate: z.string().min(1, 'กรุณาเลือกวันที่เริ่มสัญญา'),
  endDate: z.string().min(1, 'กรุณาเลือกวันที่สิ้นสุดสัญญา'),
  securityDeposit: z.coerce.number().min(0, 'กรุณากรอกเงินประกัน'),
  vehicles: z
    .array(z.object({ plateNumber: z.string(), type: z.string() }))
    .optional(),
})

export type CreateContractFormData = z.infer<typeof createContractSchema>
