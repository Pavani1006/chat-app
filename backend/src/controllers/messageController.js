import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 📌 Contacts list with unread counts
export const contactsForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const users = await Users.find({ _id: { $ne: loggedUserId } }).select(
      "-password"
    );

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

// 📌 Get chat messages
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

// 📌 Send message (supports text + image + caption)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, caption } = req.body;    // 👈 caption included
    const senderId = req.user._id;
    const receiverId = req.params._id;

    let imageUrl = "";
    if (image) {
      const uploadImage = await cloudinary.uploader.upload(image);
      imageUrl = uploadImage.secure_url;
    }

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      caption,               // 👈 stored in DB
      seenBy: [senderId],
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Mark messages as seen
export const markMessagesSeen = async (req, res) => {
  try {
    const viewerId = req.user._id;
    const chatUserId = req.params._id;

    const result = await Messages.updateMany(
      {
        senderId: chatUserId,
        receiverId: viewerId,
        seenBy: { $ne: viewerId },
      },
      { $addToSet: { seenBy: viewerId } }
    );

    if (result.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(chatUserId);
      if (senderSocketId)
        io.to(senderSocketId).emit("messagesSeen", viewerId);
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
