import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization

  const token = authHeader?.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      error: "Access token required"
    })
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    )

    ;(req as any).user = decoded

    next()

  } catch {

    return res.status(401).json({
      error: "Invalid token"
    })

  }

}