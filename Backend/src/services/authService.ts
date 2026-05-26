import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.types";
import { SafeUser, User } from "../types/user";
import { signAuthToken } from "../utils/jwt";

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface AuthService {
  register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse | null>;
  getSafeUserById(userId: number): Promise<SafeUser | null>;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
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
    const token = signAuthToken({ userId: safeUser.id, email: safeUser.email });

    return {
      user: safeUser,
      token,
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
    const token = signAuthToken({ userId: safeUser.id, email: safeUser.email });

    return {
      user: safeUser,
      token,
    };
  }

  async getSafeUserById(userId: number): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return toSafeUser(user);
  }
}
