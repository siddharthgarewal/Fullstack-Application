import { promises as fs } from "node:fs";
import path from "node:path";
import { UserMockDbSchema } from "../types/user";

const USER_MOCK_DB_PATH = path.resolve(process.cwd(), "mock", "users.json");

const defaultUserDb: UserMockDbSchema = {
  nextUserId: 1,
  users: [],
};

let writeQueue: Promise<void> = Promise.resolve();

async function ensureUserMockDbFile() {
  await fs.mkdir(path.dirname(USER_MOCK_DB_PATH), { recursive: true });

  try {
    await fs.access(USER_MOCK_DB_PATH);
  } catch {
    await fs.writeFile(
      USER_MOCK_DB_PATH,
      JSON.stringify(defaultUserDb, null, 2),
      "utf-8",
    );
  }
}

export async function readUserMockDb(): Promise<UserMockDbSchema> {
  await ensureUserMockDbFile();

  const raw = await fs.readFile(USER_MOCK_DB_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<UserMockDbSchema>;

  return {
    nextUserId:
      typeof parsed.nextUserId === "number" && parsed.nextUserId > 0
        ? parsed.nextUserId
        : 1,
    users: Array.isArray(parsed.users) ? parsed.users : [],
  };
}

export async function writeUserMockDb(
  payload: UserMockDbSchema,
): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await ensureUserMockDbFile();
    await fs.writeFile(
      USER_MOCK_DB_PATH,
      JSON.stringify(payload, null, 2),
      "utf-8",
    );
  });

  await writeQueue;
}
