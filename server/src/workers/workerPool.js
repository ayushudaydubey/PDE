const { Worker } = require("worker_threads");
const path = require("path");
const os = require("os");
const EventEmitter = require("events");
const UploadedFile = require("../models/uploadedFile.model");

class WorkerPool extends EventEmitter {
  constructor() {
    super();
    // Bounded concurrency based on CPU cores (reserving 1 core for Express main loop)
    this.maxConcurrency = Math.max(1, os.cpus().length - 1);
    this.activeWorkers = new Map(); // fileId -> Worker
    this.queue = []; // Array of job objects: { fileId, filePath, mimetype, originalName }
    this.sseClients = new Set(); // Set of Express response objects
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log(`[WORKER POOL] Initializing import queue manager with max concurrency: ${this.maxConcurrency}`);

    try {
      // Crash Recovery: Find any imports left in 'processing' or 'queued' state during server crash
      const interrupted = await UploadedFile.find({
        status: { $in: ["processing", "queued"] }
      });

      if (interrupted.length > 0) {
        console.log(`[WORKER POOL] Recovered ${interrupted.length} interrupted import jobs from previous server run.`);
        for (const doc of interrupted) {
          doc.status = "queued";
          await doc.save();

          let mimetype = "text/csv";
          if (doc.uploadPath && (doc.uploadPath.endsWith(".xlsx") || doc.uploadPath.endsWith(".xls"))) {
            mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          }

          this.addJob({
            fileId: doc._id.toString(),
            filePath: doc.uploadPath,
            mimetype,
            originalName: doc.originalName || doc.fileName
          });
        }
      }
    } catch (err) {
      console.error("[WORKER POOL] Error recovering interrupted imports:", err);
    }
  }

  // Add job to queue
  async addJob(job) {
    console.log(`[WORKER POOL] Job enqueued for file: ${job.originalName || job.fileId}`);
    
    // Update status to queued
    try {
      await UploadedFile.findByIdAndUpdate(job.fileId, { status: "queued" });
      this.broadcastEvent({ fileId: job.fileId, status: "queued", progress: 0 });
    } catch (err) {
      console.error(`[WORKER POOL] Failed to update queued status for ${job.fileId}:`, err);
    }

    this.queue.push(job);
    this.processQueue();
  }

  // Process next job if workers are available
  processQueue() {
    while (this.activeWorkers.size < this.maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      this.spawnWorker(job);
    }
  }

  spawnWorker(job) {
    const { fileId, filePath, mimetype, originalName } = job;
    const workerPath = path.resolve(__dirname, "./importWorker.js");

    console.log(`[WORKER POOL] Spawning worker thread for file: ${originalName || fileId} (${this.activeWorkers.size + 1}/${this.maxConcurrency} active)`);

    const worker = new Worker(workerPath, {
      workerData: {
        filePath,
        fileId,
        MONGO_URI: process.env.MONGO_URI,
        mimetype
      }
    });

    this.activeWorkers.set(fileId, worker);

    worker.on("message", (msg) => {
      if (msg && msg.type === "progress") {
        this.broadcastEvent({
          fileId,
          status: "processing",
          progress: msg.progress,
          processedRecords: msg.processedRecords,
          insertedRecords: msg.insertedRecords,
          updatedRecords: msg.updatedRecords,
          skippedDuplicates: msg.skippedDuplicates,
          speed: msg.speed,
          eta: msg.eta
        });
      } else if (msg && (msg.success !== undefined)) {
        console.log(`[WORKER POOL] Worker finished message for ${originalName || fileId}:`, msg);
      }
    });

    worker.on("error", (err) => {
      console.error(`[WORKER POOL] Worker thread error for ${originalName || fileId}:`, err);
      UploadedFile.findByIdAndUpdate(fileId, {
        status: "failed",
        errorMessage: err.message || "Background worker encountered an unexpected execution error.",
        progress: 100
      }).finally(() => {
        this.broadcastEvent({ fileId, status: "failed", errorMessage: err.message });
      });
    });

    worker.on("exit", (code) => {
      console.log(`[WORKER POOL] Worker exited for ${originalName || fileId} with code ${code}`);
      this.activeWorkers.delete(fileId);
      this.processQueue(); // Pick up next job in queue
    });
  }

  // Subscribe Express response stream to SSE events
  addSSEClient(res) {
    this.sseClients.add(res);
    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  // Broadcast live progress event to all connected SSE clients
  broadcastEvent(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of this.sseClients) {
      try {
        res.write(payload);
      } catch (err) {
        this.sseClients.delete(res);
      }
    }
  }
}

const workerPool = new WorkerPool();
module.exports = workerPool;
