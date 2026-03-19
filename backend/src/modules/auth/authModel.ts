// Req Input
export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
  birthdate?: string
}

export interface LoginInput {
  email: string
  password: string
}


// RESPONSES
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

export interface RegisterResponse {
  id: string
  firstName: string
  lastName: string
  email: string
}