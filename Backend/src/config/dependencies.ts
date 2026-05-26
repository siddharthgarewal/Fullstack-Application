import { createPostRepository } from "../repositories/postRepository";
import { createUserRepository } from "../repositories/userRepository";
import { DefaultAuthService } from "../services/authService";
import { DefaultPostService } from "../services/postService";

const postRepository = createPostRepository();
const userRepository = createUserRepository();

export const postService = new DefaultPostService(postRepository);
export const authService = new DefaultAuthService(userRepository);
