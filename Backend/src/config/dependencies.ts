import { createPostRepository } from "../repositories/postRepository";
import { DefaultPostService } from "../services/postService";

const postRepository = createPostRepository();

export const postService = new DefaultPostService(postRepository);
