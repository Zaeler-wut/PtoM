import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Access token required"
    });
  }

  try {

    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    // 🔥 ใช้ any ไปเลย
    (req as any).user = {
      id: decoded.sub,
      role: decoded.role
    };

    next();

  } catch (err: any) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired"
      });
    }

    return res.status(401).json({
      error: "Invalid token"
    });
  }
};