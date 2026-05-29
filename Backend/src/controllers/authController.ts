import { Request, Response } from "express";
import { authService } from "../config/dependencies";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

interface AuthPayload {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  refreshToken?: unknown;
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePassword(password: unknown): string | null {
  if (typeof password !== "string") {
    return null;
  }

  const trimmed = password.trim();
  return trimmed.length >= 6 ? trimmed : null;
}

function normalizeName(name: unknown): string | null {
  if (typeof name !== "string") {
    return null;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRefreshToken(refreshToken: unknown): string | null {
  if (typeof refreshToken !== "string") {
    return null;
  }

  const trimmed = refreshToken.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function registerHandler(req: Request, res: Response) {
  const payload = req.body as AuthPayload;

  const name = normalizeName(payload.name);
  const email = normalizeEmail(payload.email);
  const password = normalizePassword(payload.password);

  if (!name || !email || !password) {
    res.status(400).json({
      message: "Name, valid email and password (min 6 chars) are required",
    });
    return;
  }

  try {
    const response = await authService.register(name, email, password);
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    throw error;
  }
}

export async function loginHandler(req: Request, res: Response) {
  const payload = req.body as AuthPayload;

  const email = normalizeEmail(payload.email);
  const password = normalizePassword(payload.password);

  if (!email || !password) {
    res.status(400).json({
      message: "Valid email and password (min 6 chars) are required",
    });
    return;
  }

  const response = await authService.login(email, password);

  if (!response) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.status(200).json(response);
}

export async function refreshTokenHandler(req: Request, res: Response) {
  const payload = req.body as AuthPayload;
  const refreshToken = normalizeRefreshToken(payload.refreshToken);

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  const response = await authService.refresh(refreshToken);

  if (!response) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  res.status(200).json(response);
}

export async function logoutHandler(req: Request, res: Response) {
  const payload = req.body as AuthPayload;
  const refreshToken = normalizeRefreshToken(payload.refreshToken);

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  await authService.logout(refreshToken);
  res.status(200).json({ message: "Logged out" });
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth?.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await authService.getSafeUserById(authReq.auth.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user });
}
