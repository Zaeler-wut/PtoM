import { z } from 'zod'

export const propertySettingsSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อที่พัก'),
  priceMin: z.coerce.number().min(0, 'ราคาขั้นต่ำต้องไม่ติดลบ'),
  priceMax: z.coerce.number().min(0, 'ราคาสูงสุดต้องไม่ติดลบ'),
  preparingDays: z.coerce.number().min(1, 'จำนวนวันต้องมากกว่า 0'),
  contractTerm: z.string().optional().default(''),
  description: z.string().optional().default(''),
  address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  googleMap: z.string().optional().default(''),
  bankName: z.string().optional().default(''),
  bankAccount: z.string().optional().default(''),
  bankHolder: z.string().optional().default(''),
  billNote: z.string().optional().default(''),
  lat: z.string().optional().default(''),
  lng: z.string().optional().default(''),
  phone: z.string().optional().default(''),
})

export type PropertySettingsFormData = z.infer<typeof propertySettingsSchema>
