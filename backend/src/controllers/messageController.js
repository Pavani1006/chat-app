// controllers/messageController.js
import Users from "../model/userModel.js";
import Messages from "../model/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 📌 Contacts list with unread counts
export const contactsForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const users = await Users.find({ _id: { $ne: loggedUserId } }).select("-password");

    const unreadMessages = await Messages.find({
      receiverId: loggedUserId,
      seenBy: { $ne: loggedUserId },
    });

    const unread = {};
    unreadMessages.forEach((msg) => {
      unread[msg.senderId] = (unread[msg.senderId] || 0) + 1;
    });

    const updated = users.map((u) => ({
      ...u._doc,
      unreadCount: unread[u._id] || 0,
    }));

    res.status(200).json(updated);
  } catch (err) {
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

// 📌 Send message (text + image + caption + audio + document)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, caption, audio } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params._id;
    const file = req.file; // PDF / DOC / PPT / ZIP uploaded via multer

    let imageUrl = "";
    let audioUrl = "";
    let document = { url: "", name: "" };

    // upload image
    if (image) {
      const img = await cloudinary.uploader.upload(image);
      imageUrl = img.secure_url;
    }

    // upload audio
    if (audio) {
      const aud = await cloudinary.uploader.upload(audio, { resource_type: "video" });
      audioUrl = aud.secure_url;
    }

    // upload document
   if (file) {
  const upload = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",   // detects PDF, DOCX, PPT etc automatically
    use_filename: true,      // keep original filename
    unique_filename: false,  // prevent random cloudinary filename
  });

  document = {
    url: upload.secure_url,
    name: file.originalname,  // real filename saved
  };
}


    const newMessage = new Messages({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      caption,
      audio: audioUrl,
      document, // { url, name }
      seenBy: [senderId],
    });

    await newMessage.save();

    // send via socket to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Mark messages as seen
export const markMessagesSeen = async (req, res) => {
  try {
    const viewerId = req.user._id;
    const chatUserId = req.params._id;

    const update = await Messages.updateMany(
      {
        senderId: chatUserId,
        receiverId: viewerId,
        seenBy: { $ne: viewerId },
      },
      { $addToSet: { seenBy: viewerId } }
    );

    if (update.modifiedCount > 0) {
      const socketId = getReceiverSocketId(chatUserId);
      if (socketId) io.to(socketId).emit("messagesSeen", viewerId);
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
