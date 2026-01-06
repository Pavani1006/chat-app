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

    // 📸 Image message
    image: { type: String, default: "" },
    caption: { type: String, default: "" },

    // 🎤 Audio message
    audio: { type: String, default: "" },
    
audioDuration: { type: Number, default: 0 },


    // 📄 File message (PDF/docs)
    fileUrl: { type: String, default: "" }, // localhost URL
    fileName: { type: String, default: "" }, // original file name
    fileType: { type: String, default: "" }, // pdf / doc / ppt etc.
isForwarded: {
  type: Boolean,
  default: false,
},
    // 👁️ Seen status
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     // ✅ DELETE FEATURE
    isDeletedForEveryone: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
