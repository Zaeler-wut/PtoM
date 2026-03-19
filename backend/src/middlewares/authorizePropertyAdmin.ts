import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const authorizePropertyAdmin = () => {

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          error: "Not authenticated"
        });
      }

      const propertyId =
        req.params.propertyId ||
        req.body.propertyId ||
        req.query.propertyId;

      if (!propertyId) {
        return res.status(400).json({
          error: "propertyId is required"
        });
      }

      const admin = await prisma.propertyAdmin.findFirst({
        where: {
          userId: user.id,
          propertyId: String(propertyId)
        }
      });

      if (!admin) {
        return res.status(403).json({
          error: "You are not admin of this property"
        });
      }

      next();

    } catch (err) {
      return res.status(500).json({
        error: "Internal server error"
      });
    }
  };
};