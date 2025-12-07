import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Load Sidebar Users
export const contactsForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const users = await Users.find({ _id: { $ne: loggedUserId } }).select("-password");
    const messages = await Messages.find({
      receiverId: loggedUserId,
      seenBy: { $ne: loggedUserId },
    });
    const unreadCounts = {};
    messages.forEach((msg) => {
      unreadCounts[msg.senderId] = (unreadCounts[msg.senderId] || 0) + 1;
    });
    const updatedUsers = users.map((u) => ({
      ...u._doc,
      unreadCount: unreadCounts[u._id] || 0,
    }));
    res.status(200).json(updatedUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Messages
export const getMessages = async (req, res) => {
  const receiverId = req.params._id;
  const senderId = req.user._id;
  try {
    const messages = await Messages.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch {
    res.status(400).json({ message: "Invalid user Id." });
  }
};

// Send Message (Text / Image / Audio / PDF)
export const getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "chat_documents" },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate signature" });
  }
};

// 2. Simplified Send Message (Handles data from direct upload)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, fileUrl, fileName, audio, caption } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params._id;

    const newMessage = new Messages({
      senderId,
      receiverId,
      text: text || "",
      image: image || "", // Handles standard Base64 if needed for small images
      audio: audio || "",
      caption: caption || "",
      fileUrl: fileUrl || "",   // URL provided directly by Cloudinary via Frontend
      fileName: fileName || "",
      seenBy: [senderId],
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark Messages Seen
export const markMessagesSeen = async (req, res) => {
  try {
    const viewerId = req.user._id;
    const chatUserId = req.params._id;
    const result = await Messages.updateMany(
      { senderId: chatUserId, receiverId: viewerId, seenBy: { $ne: viewerId } },
      { $addToSet: { seenBy: viewerId } }
    );
    if (result.modifiedCount > 0) {
      const socketId = getReceiverSocketId(chatUserId);
      if (socketId) io.to(socketId).emit("messagesSeen", viewerId);
    }
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};