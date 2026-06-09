import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendResetEmail } from "../lib/email.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, privacy } = req.body;
    const userId = req.user._id;

    const updateData = {};

    // Handle profile pic upload
    if (profilePic) {
      // Validate data URI format
      const dataUriRegex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!dataUriRegex.test(profilePic)) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      // Check file size (base64 string size)
      const base64Data = profilePic.split(',')[1];
      const fileSizeBytes = Buffer.byteLength(base64Data, 'base64');
      const fileSizeMB = fileSizeBytes / (1024 * 1024);
      
      if (fileSizeMB > 5) {
        return res.status(400).json({ message: "File size must be less than 5MB" });
      }

      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good'
      });
      updateData.profilePic = uploadResponse.secure_url;
    }

    // Handle fullName update
    if (fullName && fullName.trim().length >= 2) {
      updateData.fullName = fullName.trim();
    }

    // Handle privacy settings update
    if (privacy) {
      const allowedDMs = ["friends", "everyone", "nobody"];
      const allowedVisibility = ["public", "friends", "private"];

      if (privacy.showOnlineStatus !== undefined) {
        updateData["privacy.showOnlineStatus"] = Boolean(privacy.showOnlineStatus);
      }
      if (privacy.readReceipts !== undefined) {
        updateData["privacy.readReceipts"] = Boolean(privacy.readReceipts);
      }
      if (privacy.allowDMsFrom && allowedDMs.includes(privacy.allowDMsFrom)) {
        updateData["privacy.allowDMsFrom"] = privacy.allowDMsFrom;
      }
      if (privacy.profileVisibility && allowedVisibility.includes(privacy.profileVisibility)) {
        updateData["privacy.profileVisibility"] = privacy.profileVisibility;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("fullName email profilePic aurevScore aurevTier createdAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak whether the email exists, return success anyway
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendResetEmail(user.email, resetToken);
      res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Error sending email. Please try again later." });
    }
  } catch (error) {
    console.log("Error in forgotPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
