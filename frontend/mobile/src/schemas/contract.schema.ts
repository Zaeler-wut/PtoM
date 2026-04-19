import { z } from "zod"

export const createContractSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().optional(),
  lineId: z.string().optional(),
  roomId: z.string().min(1, "กรุณาเลือกห้อง"),
  startDate: z.string().min(1, "กรุณาเลือกวันที่เริ่มสัญญา"),
  duration: z.string().min(1, "กรุณาเลือกระยะเวลา"),
  securityDeposit: z.coerce.number().min(0),
})

export type CreateContractFormValues = z.infer<typeof createContractSchema>

export const updateContractSchema = z.object({
  status: z.enum(["ACTIVE", "MOVE_OUT_NOTICE", "ENDED"]),
  moveOutNoticeDate: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  lineId: z.string().optional(),
})

export type UpdateContractFormValues = z.infer<typeof updateContractSchema>
