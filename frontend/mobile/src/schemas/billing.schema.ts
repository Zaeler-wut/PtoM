import { z } from "zod"

export const updateMeterSchema = z.object({
  waterMeter: z.coerce.number().min(0, "กรุณากรอกค่ามิเตอร์น้ำ"),
  electricMeter: z.coerce.number().min(0, "กรุณากรอกค่ามิเตอร์ไฟ"),
})

export type UpdateMeterFormValues = z.infer<typeof updateMeterSchema>
