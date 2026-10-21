const mongoose = require("mongoose");

const importSchema = new mongoose.Schema(
  {
    source_type: String,

    file_name: String,

    total_records: Number,

    imported_records: Number,

    duplicates_skipped: Number,

    status: {
      type: String,
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Import", importSchema);