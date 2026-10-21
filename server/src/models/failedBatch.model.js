const mongoose = require("mongoose");

const failedBatchSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedFile",
      index: true,
      required: true,
    },
    batchNumber: { type: Number, required: true },
    startRow: { type: Number, required: true },
    endRow: { type: Number, required: true },
    recordsInBatch: { type: Number, required: true },
    insertedBeforeFailure: { type: Number, default: 0 },
    skippedDuplicates: { type: Number, default: 0 },
    mongoErrorMessage: { type: String, required: true },
    mongoErrorCode: { type: Number, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

failedBatchSchema.index({ fileId: 1, batchNumber: 1 });

module.exports = mongoose.model("FailedBatch", failedBatchSchema);
