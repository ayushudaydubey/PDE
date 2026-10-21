const mongoose = require("mongoose");

const importFailureSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedFile",
      index: true,
      required: true,
    },
    batchNumber: { type: Number, required: true },
    rowNumber: { type: Number, required: true },
    companyName: { type: String, default: null },
    duplicateKey: { type: String, default: null },
    error: { type: String, required: true },
    errorCode: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

importFailureSchema.index({ fileId: 1, batchNumber: 1 });

module.exports = mongoose.model("ImportFailure", importFailureSchema);
