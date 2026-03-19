import { hashPassword, comparePassword } from "../../utils/password"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt"

export const registerService = async (data: any, repo: any) => {

  const hashed = await hashPassword(data.password)

  return repo.createUser({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashed,
    role: "USER"
  })
}


export const loginService = async (data: any, user: any) => {

  const valid = await comparePassword(data.password, user.password)

  if (!valid) throw new Error("Invalid credentials")

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  return { accessToken, refreshToken }
}