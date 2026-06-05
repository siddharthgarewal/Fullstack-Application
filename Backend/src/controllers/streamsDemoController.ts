/**
 * STREAMS & BUFFERS - HTTP DEMOS
 * ==============================
 * Each handler shows how Node streams map onto Express request/response,
 * which are themselves Readable (req) and Writable (res) streams.
 */

import { Request, Response } from "express";
import { Readable, Transform, pipeline } from "stream";

/**
 * GET /api/demo/buffer
 * Shows Buffer creation, encoding conversion, and concat - returned as JSON.
 */
export const bufferInfo = (_req: Request, res: Response) => {
  const buf = Buffer.from("Hello, Streams!", "utf-8");

  res.json({
    explanation:
      "A Buffer is a fixed-size view of raw bytes. Same bytes, multiple encodings.",
    bytes: Array.from(buf),
    length: buf.length,
    encodings: {
      utf8: buf.toString("utf-8"),
      hex: buf.toString("hex"),
      base64: buf.toString("base64"),
    },
    concat: Buffer.concat([buf, Buffer.from(" + appended")]).toString(),
  });
};

/**
 * GET /api/demo/stream/chunks
 * Streams 10 chunks with a 200ms delay each. Open this in a browser or curl
 * with --no-buffer and you will see chunks arrive over ~2 seconds rather than
 * the full payload at once. This is how SSE, video, and AI token streaming work.
 */
export const streamChunks = (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked"); // signal: length unknown, chunks coming

  let i = 0;
  const interval = setInterval(() => {
    if (i >= 10) {
      clearInterval(interval);
      res.end("[done]\n");
      return;
    }
    // res.write() returns false when its internal buffer is full - that is
    // the backpressure signal. With a fast client we will never see it here.
    res.write(`chunk ${++i} at ${new Date().toISOString()}\n`);
  }, 200);

  // If the client disconnects mid-stream, stop producing.
  _req.on("close", () => clearInterval(interval));
};

/**
 * GET /api/demo/stream/transform
 * Generates a Readable source, pipes it through a Transform that uppercases
 * the data, and writes into the response. Uses pipeline() for safe error
 * propagation and automatic cleanup if the client aborts.
 */
export const streamTransform = (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const lines = [
    "streams deliver data in chunks\n",
    "buffers hold raw bytes in memory\n",
    "transforms modify data on the fly\n",
    "pipeline wires them together safely\n",
  ];
  const source = Readable.from(lines);

  const upper = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      cb(null, chunk.toString().toUpperCase());
    },
  });

  pipeline(source, upper, res, (err) => {
    if (err && !res.writableEnded) {
      res.status(500).end(`stream failed: ${err.message}`);
    }
  });
};

/**
 * POST /api/demo/stream/upload
 * Consumes the raw request body as a stream and reports byte stats WITHOUT
 * loading the full body into memory. Try: curl -X POST --data-binary @somefile.
 *
 * Note: bypass express.json() - we want the raw stream. This route is mounted
 * before any body parser in the router.
 */
export const streamUpload = (req: Request, res: Response) => {
  let bytes = 0;
  let chunks = 0;
  const started = Date.now();

  req.on("data", (chunk: Buffer) => {
    bytes += chunk.length;
    chunks++;
  });

  req.on("end", () => {
    res.json({
      explanation:
        "The request body was read as a stream - memory stayed flat regardless of upload size.",
      bytesReceived: bytes,
      chunksReceived: chunks,
      avgChunkSize: chunks ? Math.round(bytes / chunks) : 0,
      elapsedMs: Date.now() - started,
    });
  });

  req.on("error", (err) => {
    res.status(400).json({ error: err.message });
  });
};
