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
}

export function createUserRepository(): UserRepository {
  return new MockUserRepository();
}
