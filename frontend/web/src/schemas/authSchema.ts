import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().min(1, 'กรุณากรอกอีเมล').email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
