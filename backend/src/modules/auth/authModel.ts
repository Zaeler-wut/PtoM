export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}



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

export interface RefreshTokenResponse {
  accessToken: string
}