import express, { Request, Response } from "express";
import cors from "cors";
import postRouter from "./routes/postRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript backend is running");
});

app.use("/api/posts", postRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
