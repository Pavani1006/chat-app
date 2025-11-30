import { tokenGeneration } from "../lib/token.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Already registered, Login to your account" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists!" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedpassword,
    });

    await newUser.save();
    tokenGeneration(newUser._id, res);
    res.json(newUser);
  } catch (error) {
    console.log("error in signup", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    const ispassword = await bcrypt.compare(password, user.password);
    if (!ispassword) return res.status(400).json({ message: "Invalid credentials" });

    tokenGeneration(user._id, res);
    res.status(200).json(user);
  } catch (error) {
    console.log("error in login", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout", error.message);
    res.status(500).json({ message: "Internal Server error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    let newProfileUrl = user.profilepic;
    let newPublicId = user.profilepicPublicId;

    // DELETE profile picture (now using NULL not "")
    if (profilepic === null) {
      if (user.profilepicPublicId) {
        await cloudinary.uploader.destroy(user.profilepicPublicId);
      }
      newProfileUrl = null;
      newPublicId = "";
    }

    // UPDATE profile picture
    else if (profilepic && profilepic.startsWith("data:image")) {
      if (user.profilepicPublicId) {
        await cloudinary.uploader.destroy(user.profilepicPublicId);
      }

      const uploadData = await cloudinary.uploader.upload(profilepic);
      newProfileUrl = uploadData.secure_url;
      newPublicId = uploadData.public_id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilepic: newProfileUrl,
        profilepicPublicId: newPublicId,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: "Error in updating profile",
      error: error.message,
    });
  }
};
