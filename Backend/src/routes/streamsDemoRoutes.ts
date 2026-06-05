import { Router } from "express";
import {
  bufferInfo,
  streamChunks,
  streamTransform,
  streamUpload,
} from "../controllers/streamsDemoController";

const streamsDemoRouter = Router();

streamsDemoRouter.get("/buffer", bufferInfo);
streamsDemoRouter.get("/stream/chunks", streamChunks);
streamsDemoRouter.get("/stream/transform", streamTransform);
// Upload reads the raw request stream - do not attach a body parser here.
streamsDemoRouter.post("/stream/upload", streamUpload);

export default streamsDemoRouter;
