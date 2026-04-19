// password.ts — เข้ารหัสและตรวจสอบรหัสผ่านด้วย bcrypt
// ถูกเรียกใช้จาก authService.ts ตอน register และ login

import bcrypt from "bcrypt"

// จำนวนรอบในการ hash ยิ่งมากยิ่งปลอดภัยแต่ช้ากว่า
const SALT_ROUNDS = 12

// รับ plain text password แล้วส่งกลับ hashed password
// เรียกใช้ตอน register เพื่อบันทึกลง database
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// เปรียบเทียบ plain text password กับ hash ที่เก็บไว้ใน database
// เรียกใช้ตอน login ส่งกลับ true ถ้ารหัสถูกต้อง false ถ้าไม่ถูก
export async function comparePassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash)
}
