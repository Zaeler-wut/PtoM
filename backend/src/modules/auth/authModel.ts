// authModel.ts — TypeScript interfaces สำหรับ auth module
// กำหนด shape ของ request body และ response ที่ authService รับและส่งออก

// ข้อมูลที่รับจาก request body ตอน POST /auth/register
export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

// ข้อมูลที่รับจาก request body ตอน POST /auth/login
export interface LoginInput {
  email: string
  password: string
}

// response ที่ส่งกลับหลัง register สำเร็จ
// ส่งไปยัง client พร้อม accessToken, refreshToken และข้อมูล user
export interface RegisterResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// response ที่ส่งกลับหลัง login หรือ refresh token สำเร็จ
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// response เมื่อขอ refresh token ใหม่ (ใช้เฉพาะบางกรณี)
export interface RefreshTokenResponse {
  accessToken: string
}
