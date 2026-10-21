const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String },
    sourceType: { type: String, default: "csv" },
    totalRecords: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploadPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "completed", "failed", "paused"],
      default: "pending",
    },
    processedRecords: { type: Number, default: 0 },
    insertedRecords: { type: Number, default: 0 },
    updatedRecords: { type: Number, default: 0 },
    skippedDuplicates: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    speed: { type: Number, default: 0 }, // rows/sec
    eta: { type: Number, default: 0 }, // estimated seconds remaining
    lastCheckpoint: { type: Number, default: 0 }, // last processed row offset
    lastFailedBatch: { type: Number, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);
