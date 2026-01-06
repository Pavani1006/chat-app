import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/* ===================== SIDEBAR USERS ===================== */
export const contactsForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const users = await Users.find({ _id: { $ne: loggedUserId } })
      .select("-password");

    const unreadMessages = await Messages.find({
      receiverId: loggedUserId,
      seenBy: { $ne: loggedUserId },
    });

    const unreadCounts = {};
    unreadMessages.forEach((msg) => {
      unreadCounts[msg.senderId] =
        (unreadCounts[msg.senderId] || 0) + 1;
    });

    const updatedUsers = users.map((u) => ({
      ...u._doc,
      unreadCount: unreadCounts[u._id] || 0,
    }));

    res.status(200).json(updatedUsers);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ===================== GET MESSAGES ===================== */
/* ===================== GET MESSAGES ===================== */
export const getMessages = async (req, res) => {
  try {
    // FIX: Check both 'id' and '_id' to be safe
    const receiverId = req.params.id || req.params._id;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const messages = await Messages.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    // This log will tell you exactly what's happening in your terminal
    console.log(`Fetching chat for: ${receiverId}. Found ${messages.length} messages.`);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {

    const senderId = req.user._id;
    const receiverId = req.params._id;

    let { text = "", caption = "", image = "", audio = "", audioDuration = 0,isForwarded = false, } = req.body;

   let fileUrl = req.body.fileUrl || "";
let fileName = req.body.fileName || "";
let fileType = req.body.fileType || "";
console.log("SEND MESSAGE BODY:", req.body);
    console.log("SEND MESSAGE FILE:", req.file);
    if (req.file) {
      // req.file.path is the URL from Cloudinary
      const cloudUrl = req.file.path; 

      if (req.file.mimetype.startsWith("audio/")) {
        audio = cloudUrl;
      } else if (req.file.mimetype.startsWith("image/")) {
        image = cloudUrl;
      } else {
        /* ✅ PDF FIX: Ensure the URL ends correctly and is served as a document */
        fileUrl = cloudUrl;
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
      audio,
      audioDuration,
      fileUrl,
      fileName,
      fileType,
      seenBy: [senderId],
        isForwarded,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ===================== MARK SEEN ===================== */
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
      const socketId = getReceiverSocketId(chatUserId);
      if (socketId) {
        io.to(socketId).emit("messagesSeen", viewerId);
      }
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    await Messages.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message" });
  }
};
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await Messages.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ❗ Only sender can delete for everyone
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.isDeletedForEveryone = true;
    message.text = "";
    message.image = "";
    message.audio = "";
    message.fileUrl = "";
    message.caption = "";

    await message.save();

    // 🔔 Notify receiver in real-time
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", message);
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message" });
  }
};
