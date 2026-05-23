import { readMockDb, writeMockDb } from "../db/mockDb";
import { Post } from "../types/post";
import { PostRepository } from "./postRepository.types";

class MockPostRepository implements PostRepository {
  async findAll(): Promise<Post[]> {
    const db = await readMockDb();
    return db.posts;
  }

  async findById(id: number): Promise<Post | undefined> {
    const db = await readMockDb();
    return db.posts.find((post) => post.id === id);
  }

  async create(title: string): Promise<Post> {
    const db = await readMockDb();

    const newPost: Post = {
      id: db.nextPostId,
      title,
    };

    db.posts.push(newPost);
    db.nextPostId += 1;

    await writeMockDb(db);
    return newPost;
  }

  async updateById(id: number, title: string): Promise<Post | null> {
    const db = await readMockDb();
    const post = db.posts.find((item) => item.id === id);

    if (!post) {
      return null;
    }

    post.title = title;
    await writeMockDb(db);

    return post;
  }

  async deleteById(id: number): Promise<boolean> {
    const db = await readMockDb();
    const previousLength = db.posts.length;

    db.posts = db.posts.filter((post) => post.id !== id);

    if (db.posts.length === previousLength) {
      return false;
    }

    await writeMockDb(db);
    return true;
  }
}

export function createPostRepository(): PostRepository {
  return new MockPostRepository();
}
