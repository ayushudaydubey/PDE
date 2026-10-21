const express = require("express");

const { login, register, logout, meController, updatePassword, forgotPassword, verifyOTP, resetPassword } = require("../../controllers/auth/authController");
const refreshAccessToken = require("../../utils/refreshToken");
const { protect } = require("../../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 4, // Limit each IP to 4 requests per window
  message: {
    message: "Rate limit exceeded. You can only request up to 4 OTPs every 15 minutes from this IP address.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();


router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protect, meController);
router.post("/logout", protect, logout);
router.put("/update-password", protect, updatePassword);

// Forgot Password Flow
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);



module.exports = router;