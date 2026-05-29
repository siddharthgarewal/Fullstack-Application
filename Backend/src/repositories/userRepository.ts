import { readUserMockDb, writeUserMockDb } from "../db/userMockDb";
import { User } from "../types/user";
import { UserRepository } from "./userRepository.types";

class MockUserRepository implements UserRepository {
  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const db = await readUserMockDb();

    const newUser: User = {
      id: db.nextUserId,
      name,
      email,
      passwordHash,
      refreshTokenHash: null,
    };

    db.users.push(newUser);
    db.nextUserId += 1;

    await writeUserMockDb(db);

    return newUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = await readUserMockDb();
    return db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async findById(id: number): Promise<User | undefined> {
    const db = await readUserMockDb();
    return db.users.find((user) => user.id === id);
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshTokenHash: string | null,
  ): Promise<User | undefined> {
    const db = await readUserMockDb();
    const user = db.users.find((entry) => entry.id === userId);

    if (!user) {
      return undefined;
    }

    user.refreshTokenHash = refreshTokenHash;
    await writeUserMockDb(db);

    return user;
  }
}

export function createUserRepository(): UserRepository {
  return new MockUserRepository();
}
