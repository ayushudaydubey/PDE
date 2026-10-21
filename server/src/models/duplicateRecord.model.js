const mongoose = require("mongoose");

const duplicateRecordSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedFile",
      required: true,
      index: true,
    },
    company_name: { type: String, default: null },
    email: { type: String, default: null },
    website: { type: String, default: null },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DuplicateRecord", duplicateRecordSchema);
