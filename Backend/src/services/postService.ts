import { Post } from "../types/post";
import { PostRepository } from "../repositories/postRepository.types";

export interface PostService {
  getAllPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  createPost(title: string): Promise<Post>;
  updatePost(id: number, title: string): Promise<Post | null>;
  deletePost(id: number): Promise<boolean>;
}

export class DefaultPostService implements PostService {
  constructor(private readonly postRepository: PostRepository) {}

  getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  getPostById(id: number): Promise<Post | undefined> {
    return this.postRepository.findById(id);
  }

  createPost(title: string): Promise<Post> {
    return this.postRepository.create(title);
  }

  updatePost(id: number, title: string): Promise<Post | null> {
    return this.postRepository.updateById(id, title);
  }

  deletePost(id: number): Promise<boolean> {
    return this.postRepository.deleteById(id);
  }
}
