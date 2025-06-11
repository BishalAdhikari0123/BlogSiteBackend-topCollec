import catchAsync from "../helper/catchAsync.js";
import User from "../models/users.js";
import { sendRegistrationOtp } from "../mailer/email.js";
import Otp from "../models/otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function upsertOtp(email) {
  const otp = await sendRegistrationOtp(email);
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email },
    { otp: hashedOtp, expirationTime, createdAt: new Date() },
    { upsert: true, new: true }
  );
}

const register = catchAsync(async (req, res) => {
  const { username, password, email, bio, profileImage } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Username, password, and email are required.",
    });
  }

  const existingUserByEmail = await User.findOne({ email });

  if (existingUserByEmail) {
    if (!existingUserByEmail.isEmailVerified) {
      await upsertOtp(email);

      return res.status(200).json({
        success: true,
        message: "OTP resent. Please verify your email.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Email already taken, try a new one!",
      });
    }
  }

  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    return res.status(400).json({
      success: false,
      message: "Username already taken, please choose another.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    password: hashedPassword,
    email,
    bio,
    profileImage,
    isEmailVerified: false,
  });

  await upsertOtp(email);

  return res.status(201).json({
    success: true,
    message:
      "Account registered successfully. Please check your email to verify!",
    user: {
      email: newUser.email,
      username: newUser.username,
    },
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: "OTP not found or expired. Please request a new one.",
    });
  }

  if (otpRecord.expirationTime < new Date()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new one.",
    });
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOtpValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }

  const user = await User.findOneAndUpdate(
    { email },
    { isEmailVerified: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  await Otp.deleteOne({ email });

  // ✅ Generate JWT token after verification
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email is not verified. Please verify your email first.",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password.",
    });
  }

  // ✅ Generate JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
    },
  });
});

const becomeAWriter = catchAsync(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login.",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email not verified. Please verify your email before applying.",
    });
  }

  if (user.role === "writer") {
    return res.status(400).json({
      success: false,
      message: "You are already a writer.",
    });
  }

  user.role = "writer";
  await user.save();

  return res.status(200).json({
    success: true,
    message: "You are now a writer!",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isWriter: user.isWriter,
    },
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified.",
    });
  }

  await upsertOtp(email);

  return res.status(200).json({
    success: true,
    message: "OTP resent. Please check your email.",
  });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with that email.",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email not verified. Please verify your email first.",
    });
  }

  await upsertOtp(email);

  return res.status(200).json({
    success: true,
    message: "OTP sent to your email. Please use it to reset your password.",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required.",
    });
  }

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: "OTP not found or expired. Please request a new one.",
    });
  }

  if (otpRecord.expirationTime < new Date()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new one.",
    });
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOtpValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteOne({ email });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});

const authController = {
  register,
  verifyEmail,
  login,
  becomeAWriter,
  resendOtp,
  changePassword,
  forgotPassword,
  resetPassword,
};

export default authController;
