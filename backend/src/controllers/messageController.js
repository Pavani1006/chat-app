import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 📌 Sidebar Users
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

    const updated = users.map((u) => ({
      ...u._doc,
      unreadCount: unreadCounts[u._id] || 0,
    }));

    res.status(200).json(updated);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Get Messages
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

// 📩 Send Message (FULL FIXED)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params._id;

    let { text = "", caption = "", audio = "", image = "" } = req.body;

    let fileUrl = "";
    let fileName = "";
    let fileType = "";

    // 🔥 If multer uploaded a file
    if (req.file) {
      const base = process.env.BASE_URL || "http://localhost:5000";

      // 🎤 Voice message
      if (req.file.mimetype.startsWith("audio/")) {
        audio = `${base}/uploads/${req.file.filename}`;
      }
      // 📄 PDF / DOC / PPT / ZIP
      else {
        fileUrl = `${base}/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
        fileType = req.file.mimetype;
      }
    }

    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      caption,
      image,
      audio,      // 🔥 voice stored correctly
      fileUrl,    // 🔥 for documents
      fileName,
      fileType,
      seenBy: [senderId],
    });

    await newMessage.save();

    // 🔔 Realtime emit
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Send Message Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 👁️ Seen
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
