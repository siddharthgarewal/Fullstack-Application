import { User } from "../types/user";

export interface UserRepository {
  create(name: string, email: string, passwordHash: string): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
}
