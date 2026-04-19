import { z } from 'zod'

export const addRoomSchema = z.object({
  roomNumber: z.string().min(1, 'กรุณากรอกเลขห้อง'),
  floor: z.string().min(1, 'กรุณากรอกชั้น'),
  roomTypeId: z.string().min(1, 'กรุณาเลือกประเภทห้อง'),
})

export const editRoomSchema = addRoomSchema.extend({
  status: z.enum(['AVAILABLE', 'RESERVED', 'PREPARING', 'MAINTENANCE']),
})

export type AddRoomFormData = z.infer<typeof addRoomSchema>
export type EditRoomFormData = z.infer<typeof editRoomSchema>
