/**
 * STREAMS & BUFFERS IN NODE.JS - A WALKTHROUGH
 * ============================================
 *
 * Run: npx ts-node src/demos/streamsAndBuffers.ts
 *
 * WHY THESE EXIST
 * ---------------
 * Node.js is single-threaded and event-driven. If you read a 2 GB file with
 * fs.readFileSync, the entire file is loaded into memory before you can touch
 * the first byte - and the event loop is blocked the whole time. Buffers and
 * streams solve this: process bytes in small chunks, as they arrive, without
 * holding the whole payload in memory.
 *
 *   - Buffer  = a fixed-size chunk of raw binary data (Uint8Array under the hood).
 *   - Stream  = an EventEmitter that produces or consumes Buffers over time.
 */

import { Readable, Writable, Transform, pipeline } from "stream";
import { createReadStream, createWriteStream, writeFileSync, unlinkSync } from "fs";
import { promisify } from "util";
import path from "path";

const pipelineAsync = promisify(pipeline);
const section = (title: string) => console.log(`\n=== ${title} ===`);

async function bufferDemo() {
  section("1. BUFFERS - raw binary data");

  // Three ways to create a buffer:
  const fromString = Buffer.from("Hello, Buffer!", "utf-8");
  const allocated = Buffer.alloc(8);          // zero-filled, safe
  const unsafe = Buffer.allocUnsafe(8);       // faster, contains old memory - must overwrite
  unsafe.fill(0);

  console.log("from string         :", fromString);
  console.log("as utf-8            :", fromString.toString("utf-8"));
  console.log("as hex              :", fromString.toString("hex"));
  console.log("as base64           :", fromString.toString("base64"));
  console.log("byte length         :", fromString.length);
  console.log("first byte (H=0x48) :", fromString[0]);

  // Buffers are mutable and indexable like arrays
  allocated.write("ABCD", 0, "utf-8");
  console.log("written buffer      :", allocated, "->", allocated.toString("utf-8").trim());

  // Concatenate is how you assemble streamed chunks into a single payload
  const joined = Buffer.concat([fromString, Buffer.from(" ✓")]);
  console.log("concatenated        :", joined.toString());
}

async function readableStreamDemo() {
  section("2. READABLE STREAM - producing data over time");

  // A Readable stream emits 'data' events as chunks become available,
  // then 'end' when the source is exhausted. Backpressure is built-in:
  // if the consumer is slow, the producer pauses.
  const source = Readable.from(["chunk-A ", "chunk-B ", "chunk-C"]);

  await new Promise<void>((resolve, reject) => {
    source.on("data", (chunk) => console.log("received chunk      :", chunk));
    source.on("end", () => {
      console.log("stream ended (no more data)");
      resolve();
    });
    source.on("error", reject);
  });
}

async function writableStreamDemo() {
  section("3. WRITABLE STREAM - consuming data over time");

  // A Writable stream is the destination. .write() returns false when the
  // internal buffer (highWaterMark, default 16 KB) is full - that's the
  // signal to pause the producer and wait for 'drain'.
  const collected: string[] = [];
  const sink = new Writable({
    write(chunk: Buffer, _enc, callback) {
      collected.push(chunk.toString());
      callback(); // signal we're ready for the next chunk
    },
  });

  sink.write("first ");
  sink.write("second ");
  sink.end("third");

  await new Promise<void>((resolve) => sink.on("finish", resolve));
  console.log("sink received       :", collected.join(""));
}

async function transformStreamDemo() {
  section("4. TRANSFORM STREAM - read in, write out, modified");

  // Transform = Readable + Writable combined. Perfect for compression,
  // encryption, parsing, etc. Here we uppercase each chunk.
  const upper = new Transform({
    transform(chunk: Buffer, _enc, callback) {
      callback(null, chunk.toString().toUpperCase());
    },
  });

  const out: string[] = [];
  await new Promise<void>((resolve, reject) => {
    Readable.from(["streams ", "are ", "lazy"])
      .pipe(upper)
      .on("data", (c) => out.push(c.toString()))
      .on("end", resolve)
      .on("error", reject);
  });
  console.log("uppercased output   :", out.join(""));
}

async function pipelineDemo() {
  section("5. PIPELINE - the production-safe way to chain streams");

  // pipe() does not propagate errors or clean up on failure. pipeline()
  // does both, and supports async/await via util.promisify.
  const tmp = path.join(__dirname, "_pipeline_demo.txt");
  writeFileSync(tmp, "the quick brown fox jumps over the lazy dog\n".repeat(3));

  const reverseLines = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      const flipped = chunk
        .toString()
        .split("\n")
        .map((l) => l.split("").reverse().join(""))
        .join("\n");
      cb(null, flipped);
    },
  });

  const outFile = path.join(__dirname, "_pipeline_demo.out.txt");
  await pipelineAsync(createReadStream(tmp), reverseLines, createWriteStream(outFile));
  console.log("pipeline complete   : wrote reversed text to", path.basename(outFile));

  // Clean up demo files
  unlinkSync(tmp);
  unlinkSync(outFile);
}

async function backpressureDemo() {
  section("6. BACKPRESSURE - why streams beat readFile for large data");

  // Demonstrates the .write() returning false signal. In real code,
  // pipeline() handles this for you; this is just to show the mechanism.
  const slowSink = new Writable({
    highWaterMark: 16, // tiny buffer to force backpressure quickly
    write(_chunk, _enc, cb) {
      setTimeout(cb, 5); // simulate slow consumer
    },
  });

  let pauses = 0;
  for (let i = 0; i < 5; i++) {
    const ok = slowSink.write(Buffer.alloc(32, "x"));
    if (!ok) {
      pauses++;
      await new Promise((r) => slowSink.once("drain", r));
    }
  }
  slowSink.end();
  console.log(`producer paused ${pauses}x waiting for 'drain' - this is backpressure`);
}

async function main() {
  await bufferDemo();
  await readableStreamDemo();
  await writableStreamDemo();
  await transformStreamDemo();
  await pipelineDemo();
  await backpressureDemo();

  console.log(`
=== TAKEAWAYS ===
- Buffer  : raw bytes in memory (Uint8Array). Use for binary data, encodings.
- Stream  : data delivered in chunks over time via events. Use for large/unknown-size payloads.
- 4 types : Readable, Writable, Duplex (both), Transform (Duplex that modifies).
- Always  : prefer pipeline() over .pipe() in production - it propagates errors and cleans up.
- Win     : constant memory usage regardless of source size + lower time-to-first-byte.
`);
}

main().catch((err) => {
  console.error("demo failed:", err);
  process.exit(1);
});
