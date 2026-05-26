import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: number;
    email: string;
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAuthToken(token);
    (req as AuthenticatedRequest).auth = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
