// models/messageModel.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: { type: String, default: "" },
    image: { type: String, default: "" },   // cloudinary url
    caption: { type: String, default: "" },
    audio: { type: String, default: "" },   // cloudinary url

    // 📄 File (pdf, doc, ppt etc)
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },

    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
