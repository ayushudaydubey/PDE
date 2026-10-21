const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
