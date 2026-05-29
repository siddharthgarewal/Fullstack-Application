import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.types";
import { SafeUser, User } from "../types/user";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthService {
  register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse | null>;
  refresh(refreshToken: string): Promise<RefreshResponse | null>;
  logout(refreshToken: string): Promise<void>;
  getSafeUserById(userId: number): Promise<SafeUser | null>;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function createTokenPair(user: SafeUser): RefreshResponse {
  return {
    accessToken: signAccessToken({ userId: user.id, email: user.email }),
    refreshToken: signRefreshToken({ userId: user.id, email: user.email }),
  };
}

export class DefaultAuthService implements AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await this.userRepository.create(
      name,
      email.toLowerCase(),
      passwordHash,
    );

    const safeUser = toSafeUser(createdUser);
    const tokenPair = createTokenPair(safeUser);
    const refreshTokenHash = await bcrypt.hash(tokenPair.refreshToken, 10);
    await this.userRepository.updateRefreshTokenHash(
      safeUser.id,
      refreshTokenHash,
    );

    return {
      user: safeUser,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse | null> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const safeUser = toSafeUser(user);
    const tokenPair = createTokenPair(safeUser);
    const refreshTokenHash = await bcrypt.hash(tokenPair.refreshToken, 10);
    await this.userRepository.updateRefreshTokenHash(
      safeUser.id,
      refreshTokenHash,
    );

    return {
      user: safeUser,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponse | null> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.refreshTokenHash) {
        return null;
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        return null;
      }

      const safeUser = toSafeUser(user);
      const tokenPair = createTokenPair(safeUser);
      const nextRefreshHash = await bcrypt.hash(tokenPair.refreshToken, 10);

      await this.userRepository.updateRefreshTokenHash(
        user.id,
        nextRefreshHash,
      );

      return tokenPair;
    } catch {
      return null;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(payload.userId);

      if (!user || !user.refreshTokenHash) {
        return;
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        return;
      }

      await this.userRepository.updateRefreshTokenHash(user.id, null);
    } catch {
      // Ignore invalid tokens during logout to keep endpoint idempotent.
    }
  }

  async getSafeUserById(userId: number): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return toSafeUser(user);
  }
}
