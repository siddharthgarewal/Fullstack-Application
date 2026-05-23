import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface Post {
  id: number;
  title: string;
}

let posts: Post[] = [
  { id: 1, title: "Build Redux Toolkit project" },
  { id: 2, title: "Connect frontend to backend APIs" },
];

let nextPostId = 3;

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript backend is running");
});

app.get("/api/posts", (_req: Request, res: Response) => {
  res.status(200).json(posts);
});

app.get("/api/posts/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  const post = posts.find((item) => item.id === id);

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(200).json(post);
});

app.post("/api/posts", (req: Request, res: Response) => {
  const title = req.body?.title;

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const newPost: Post = {
    id: nextPostId,
    title: title.trim(),
  };

  posts.push(newPost);
  nextPostId += 1;

  res.status(201).json(newPost);
});

app.put("/api/posts/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const title = req.body?.title;

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const post = posts.find((item) => item.id === id);

  if (!post) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  post.title = title.trim();
  res.status(200).json(post);
});

app.delete("/api/posts/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid post id" });
    return;
  }

  const previousLength = posts.length;
  posts = posts.filter((item) => item.id !== id);

  if (posts.length === previousLength) {
    res.status(404).json({ message: "Post not found" });
    return;
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
