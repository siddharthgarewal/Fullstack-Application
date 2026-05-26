import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_jwt_secret_change_in_production";
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "1d";

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
