const mongoose = require('mongoose');

const regenerateHistorySchema = new mongoose.Schema(
  {
    originalExport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExportHistory',
      required: true,
    },
    filters: {
      type: Object,
      default: {},
    },
    ignoredColumns: {
      type: [String],
      default: [],
    },
    regeneratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    regeneratedAt: {
      type: Date,
      default: Date.now,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RegenerateHistory', regenerateHistorySchema);
