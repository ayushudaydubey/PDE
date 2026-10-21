const mongoose = require("mongoose");

const exportHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    exportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exportedAt: {
      type: Date,
      default: Date.now,
    },
    ignoredColumns: {
      type: [String],
      default: [],
    },
    regenerateCount: {
      type: Number,
      default: 0,
    },
    exportSource: {
      type: String,
      default: "Centralized DB",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ExportHistory", exportHistorySchema);