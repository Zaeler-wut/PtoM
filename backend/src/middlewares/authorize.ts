import { Request, Response, NextFunction } from "express"
import type { AuthenticatedRequest } from "./authenticate"

// Role enum ตรงกับ Prisma schema
type Role = "USER" | "ADMIN"

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    if (!roles.includes(user.role as Role)) {
      return res.status(403).json({ error: "Access denied" })
    }

    next()
  }
}