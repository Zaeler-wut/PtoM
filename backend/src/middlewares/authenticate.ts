import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    role: string
    email: string
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    )

    if (!decoded?.sub || !decoded?.role) {
      return res.status(401).json({ error: "Invalid token payload" })
    }

    ;(req as AuthenticatedRequest).user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email ?? "",
    }

    next()
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    return res.status(401).json({ error: "Invalid token" })
  }
}