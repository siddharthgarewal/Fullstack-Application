import { Post } from "../types/post";

export interface PostRepository {
  findAll(): Promise<Post[]>;
  findById(id: number): Promise<Post | undefined>;
  create(title: string): Promise<Post>;
  updateById(id: number, title: string): Promise<Post | null>;
  deleteById(id: number): Promise<boolean>;
}
