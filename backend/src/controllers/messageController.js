import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 📌 Get contacts for sidebar
export const contactsForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const users = await Users.find({ _id: { $ne: loggedUserId } }).select(
      "-password"
    );

    // Get all messages once to calculate unread counts
    const messages = await Messages.find({
      receiverId: loggedUserId,
      seenBy: { $ne: loggedUserId },
    });

    const unreadCounts = {}; // { senderId: count }
    messages.forEach((msg) => {
      unreadCounts[msg.senderId] = (unreadCounts[msg.senderId] || 0) + 1;
    });

    const updatedUsers = users.map((u) => ({
      ...u._doc,
      unreadCount: unreadCounts[u._id] || 0,
    }));

    res.status(200).json(updatedUsers);
  } catch (error) {
    console.log("error in contactsForSidebar", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


// 📌 Get all messages between two users
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
  } catch (error) {
    console.log("error in getMessages Controller.", error.message);
    res.status(400).json({ message: "invalid user Id format." });
  }
};

// 📌 Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params._id;

    let imageUrl;
    if (image) {
      const uploadImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadImage.secure_url;
    }

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seenBy: [senderId], // ⭐ sender already seen own msg
    });

    await newMessage.save();

    // 🔥 Emit socket event to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage Controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Mark messages as seen
export const markMessagesSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatUserId = req.params._id;

    await Messages.updateMany(
      { senderId: chatUserId, receiverId: userId, seenBy: { $ne: userId } },
      { $push: { seenBy: userId } }
    );

    // 🔥 Notify the sender in realtime
    const senderSocketId = getReceiverSocketId(chatUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { userId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("error in markMessagesSeen Controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
