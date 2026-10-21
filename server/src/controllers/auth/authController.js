const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendOTPEmail } = require("../../utils/emailService");


const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const register = async (req, res) => {
  try {
    const { name, email, phone, mobile, password, role } = req.body;
    const phoneNumber = phone || mobile;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
        error: "Email already exists",
      });
    }

    if (phoneNumber) {
      const existingPhone = await User.findOne({ phone: phoneNumber });

      if (existingPhone) {
        return res.status(400).json({
          message: "Phone number already exists",
          error: "Phone number already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone: phoneNumber,
      password: hashedPassword,
      role: role || "sales",
    });

    // Hide password
    const userData = user.toObject();

    delete userData.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;

    await user.save();

    // Hide password
    const userData = user.toObject();

    delete userData.password;

    // Cookies
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction, // must be true in production for cross-site cookies
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear cookies with same attributes used when setting them
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const meController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};





const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Enforce 15-minute window rate limit (max 4 attempts)
    const now = new Date();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    if (!user.otpWindowStart || now.getTime() - new Date(user.otpWindowStart).getTime() > windowMs) {
      user.otpAttemptsCount = 0;
      user.otpWindowStart = now;
    }

    if (user.otpAttemptsCount >= 4) {
      const remainingMins = Math.ceil((windowMs - (now.getTime() - new Date(user.otpWindowStart).getTime())) / 60000);
      return res.status(429).json({
        message: `Rate limit exceeded. You can only request up to 4 OTPs every 15 minutes. Please try again after ${Math.max(1, remainingMins)} minute(s).`,
      });
    }

    user.otpAttemptsCount += 1;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 15 minutes
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 15);

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpires;
    await user.save();

    const emailSent = await sendOTPEmail(user.email, user.name || "User", otp);
    
    if (!emailSent) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent successfully to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  meController,
  updatePassword,
  forgotPassword,
  verifyOTP,
  resetPassword
};