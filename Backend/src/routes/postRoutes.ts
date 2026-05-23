import { Router } from "express";
import {
  createPostHandler,
  deletePostHandler,
  getPostById,
  getPosts,
  updatePostHandler,
} from "../controllers/postController";
import { asyncHandler } from "../utils/asyncHandler";

const postRouter = Router();

postRouter.get("/", asyncHandler(getPosts));
postRouter.get("/:id", asyncHandler(getPostById));
postRouter.post("/", asyncHandler(createPostHandler));
postRouter.put("/:id", asyncHandler(updatePostHandler));
postRouter.delete("/:id", asyncHandler(deletePostHandler));

export default postRouter;
