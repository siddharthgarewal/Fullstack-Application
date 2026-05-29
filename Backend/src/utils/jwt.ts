import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_in_production";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_in_production";

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
}
