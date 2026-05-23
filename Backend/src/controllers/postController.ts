import { Request, Response } from "express";
import { postService } from "../config/dependencies";

function validatePostId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isNaN(id) ? null : id;
}

function validateTitle(title: unknown): string | null {
  if (typeof title !== "string") {
    return null;
  }

  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getPosts(_req: Request, res: Response) {
  const posts = await postService.getAllPosts();
  res.status(200).json(posts);
}

export async function getPostById(req: Request, res: Response) {
  const id = validatePostId(req.params.id);

  if (id === null) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  const post = await postService.getPostById(id);

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(200).json(post);
}

export async function createPostHandler(req: Request, res: Response) {
  const title = validateTitle(req.body?.title);

  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const createdPost = await postService.createPost(title);
  res.status(201).json(createdPost);
}

export async function updatePostHandler(req: Request, res: Response) {
  const id = validatePostId(req.params.id);

  if (id === null) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  const title = validateTitle(req.body?.title);

  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const updatedPost = await postService.updatePost(id, title);

  if (!updatedPost) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(200).json(updatedPost);
}

export async function deletePostHandler(req: Request, res: Response) {
  const id = validatePostId(req.params.id);

  if (id === null) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  const isDeleted = await postService.deletePost(id);

  if (!isDeleted) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(204).send();
}
