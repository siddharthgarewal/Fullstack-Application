import { promises as fs } from "node:fs";
import path from "node:path";
import { MockDbSchema } from "../types/post";

const MOCK_DB_PATH = path.resolve(process.cwd(), "mock", "posts.json");

const defaultDb: MockDbSchema = {
  nextPostId: 1,
  posts: [],
};

let writeQueue: Promise<void> = Promise.resolve();

async function ensureMockDbFile() {
  await fs.mkdir(path.dirname(MOCK_DB_PATH), { recursive: true });

  try {
    await fs.access(MOCK_DB_PATH);
  } catch {
    await fs.writeFile(
      MOCK_DB_PATH,
      JSON.stringify(defaultDb, null, 2),
      "utf-8",
    );
  }
}

export async function readMockDb(): Promise<MockDbSchema> {
  await ensureMockDbFile();

  const raw = await fs.readFile(MOCK_DB_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<MockDbSchema>;

  return {
    nextPostId:
      typeof parsed.nextPostId === "number" && parsed.nextPostId > 0
        ? parsed.nextPostId
        : 1,
    posts: Array.isArray(parsed.posts) ? parsed.posts : [],
  };
}

export async function writeMockDb(payload: MockDbSchema): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await ensureMockDbFile();
    await fs.writeFile(MOCK_DB_PATH, JSON.stringify(payload, null, 2), "utf-8");
  });

  await writeQueue;
}
