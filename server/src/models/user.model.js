const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    phone: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["superadmin","admin", "sales", "marketing", "cold_mail"],
      default: "sales",
    },

    resetPasswordOTP: {
      type: String,
    },
    
    resetPasswordOTPExpires: {
      type: Date,
    },

    otpAttemptsCount: {
      type: Number,
      default: 0,
    },

    otpWindowStart: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);