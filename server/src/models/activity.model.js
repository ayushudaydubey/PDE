const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    targetListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TargetList",
      default: null,
    },
    type: {
      type: String,
      enum: ["Call", "Email", "Meeting", "Demo", "Visit", "Follow-up", "Note", "Status Change", "Assignment"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
